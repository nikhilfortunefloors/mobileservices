import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'repairman' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceBrand {
  id: string;
  device_type: 'mobile' | 'laptop';
  brand_name: string;
  is_active: boolean;
  created_at: string;
}

export interface DeviceModel {
  id: string;
  brand_id: string;
  model_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  service_name: string;
  description: string | null;
  device_type: 'mobile' | 'laptop' | 'common';
  normal_price: number;
  premium_price: number;
  other_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  device_type: 'mobile' | 'laptop';
  brand_id: string;
  model_id: string | null;
  custom_model: string | null;
  service_id: string;
  quality_tier: 'normal' | 'premium' | 'other';
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  repairman_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  customer_id: string;
  device_type: 'mobile' | 'laptop';
  brand_id: string;
  model_id: string | null;
  custom_model: string | null;
  service_id: string;
  quality_tier: 'normal' | 'premium' | 'other';
  price: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  booking_id: string | null;
  title: string;
  message: string;
  type: 'booking' | 'status_update' | 'admin';
  is_read: boolean;
  created_at: string;
}

export interface PromotionalCard {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
