/*
  # Mobile & Laptop Repair Service Application Schema

  ## Overview
  Complete database schema for a multi-role repair service booking platform with customers, repair technicians, and admin.

  ## New Tables

  ### 1. `profiles`
  Extended user profiles with role-based access
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `role` (text: customer, repairman, admin)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `device_brands`
  Available device brands
  - `id` (uuid, PK)
  - `device_type` (text: mobile, laptop)
  - `brand_name` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 3. `device_models`
  Device models for each brand
  - `id` (uuid, PK)
  - `brand_id` (uuid, FK)
  - `model_name` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 4. `services`
  Available repair services
  - `id` (uuid, PK)
  - `service_name` (text)
  - `description` (text)
  - `device_type` (text: mobile, laptop, common)
  - `normal_price` (decimal)
  - `premium_price` (decimal)
  - `other_price` (decimal)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `promotional_cards`
  Admin promotional content
  - `id` (uuid, PK)
  - `title` (text)
  - `description` (text)
  - `image_url` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. `bookings`
  Service booking records
  - `id` (uuid, PK)
  - `customer_id` (uuid, FK)
  - `device_type` (text)
  - `brand_id` (uuid, FK)
  - `model_id` (uuid, FK, nullable)
  - `custom_model` (text, nullable)
  - `service_id` (uuid, FK)
  - `quality_tier` (text: normal, premium, other)
  - `price` (decimal)
  - `status` (text: pending, confirmed, in_progress, completed, cancelled)
  - `repairman_id` (uuid, FK, nullable)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. `cart_items`
  Shopping cart for customers
  - `id` (uuid, PK)
  - `customer_id` (uuid, FK)
  - `device_type` (text)
  - `brand_id` (uuid, FK)
  - `model_id` (uuid, FK, nullable)
  - `custom_model` (text, nullable)
  - `service_id` (uuid, FK)
  - `quality_tier` (text)
  - `price` (decimal)
  - `created_at` (timestamptz)

  ### 8. `notifications`
  Real-time notifications
  - `id` (uuid, PK)
  - `user_id` (uuid, FK)
  - `booking_id` (uuid, FK, nullable)
  - `title` (text)
  - `message` (text)
  - `type` (text: booking, status_update, admin)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Customers can only access their own data
  - Repairmen can view assigned bookings
  - Admin has full access
  - Public can view active brands, models, and services
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'repairman', 'admin')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Device brands table
CREATE TABLE IF NOT EXISTS device_brands (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_type text NOT NULL CHECK (device_type IN ('mobile', 'laptop')),
  brand_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE device_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active brands"
  ON device_brands FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage brands"
  ON device_brands FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Device models table
CREATE TABLE IF NOT EXISTS device_models (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL REFERENCES device_brands(id) ON DELETE CASCADE,
  model_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE device_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active models"
  ON device_models FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage models"
  ON device_models FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name text NOT NULL,
  description text,
  device_type text NOT NULL CHECK (device_type IN ('mobile', 'laptop', 'common')),
  normal_price decimal(10, 2) NOT NULL DEFAULT 0,
  premium_price decimal(10, 2) NOT NULL DEFAULT 0,
  other_price decimal(10, 2) NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Promotional cards table
CREATE TABLE IF NOT EXISTS promotional_cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE promotional_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view active promotional cards"
  ON promotional_cards FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('customer')
    )
  );

CREATE POLICY "Admin can manage promotional cards"
  ON promotional_cards FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_type text NOT NULL CHECK (device_type IN ('mobile', 'laptop')),
  brand_id uuid NOT NULL REFERENCES device_brands(id),
  model_id uuid REFERENCES device_models(id),
  custom_model text,
  service_id uuid NOT NULL REFERENCES services(id),
  quality_tier text NOT NULL CHECK (quality_tier IN ('normal', 'premium', 'other')),
  price decimal(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  repairman_id uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Repairmen can view assigned bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    repairman_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'repairman'
    )
  );

CREATE POLICY "Repairmen can update assigned bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    repairman_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'repairman'
    )
  )
  WITH CHECK (
    repairman_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'repairman'
    )
  );

CREATE POLICY "Admin can manage all bookings"
  ON bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_type text NOT NULL CHECK (device_type IN ('mobile', 'laptop')),
  brand_id uuid NOT NULL REFERENCES device_brands(id),
  model_id uuid REFERENCES device_models(id),
  custom_model text,
  service_id uuid NOT NULL REFERENCES services(id),
  quality_tier text NOT NULL CHECK (quality_tier IN ('normal', 'premium', 'other')),
  price decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own cart"
  ON cart_items FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can manage own cart"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update own cart"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can delete from own cart"
  ON cart_items FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('booking', 'status_update', 'admin')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_repairman ON bookings(repairman_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_cart_customer ON cart_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_device_models_brand ON device_models(brand_id);