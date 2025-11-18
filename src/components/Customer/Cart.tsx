import { useEffect, useState } from 'react';
import { Trash2, ShoppingCart, Package } from 'lucide-react';
import { supabase, CartItem } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface CartProps {
  onCheckout: () => void;
}

interface CartItemWithDetails extends CartItem {
  brand_name?: string;
  model_name?: string;
  service_name?: string;
}

export function Cart({ onCheckout }: CartProps) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          device_brands:brand_id (brand_name),
          device_models:model_id (model_name),
          services:service_id (service_name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const itemsWithDetails = (data || []).map((item: any) => ({
        ...item,
        brand_name: item.device_brands?.brand_name,
        model_name: item.device_models?.model_name,
        service_name: item.services?.service_name,
      }));

      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setCartItems(cartItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setProcessing(true);
    try {
      const bookings = cartItems.map((item) => ({
        customer_id: user.id,
        device_type: item.device_type,
        brand_id: item.brand_id,
        model_id: item.model_id,
        custom_model: item.custom_model,
        service_id: item.service_id,
        quality_tier: item.quality_tier,
        price: item.price,
        status: 'pending',
      }));

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert(bookings);

      if (bookingError) throw bookingError;

      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', user.id);

      if (cartError) throw cartError;

      const { data: repairmen } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'repairman')
        .eq('is_active', true);

      if (repairmen && repairmen.length > 0) {
        const notifications = repairmen.map((repairman) => ({
          user_id: repairman.id,
          title: 'New Booking',
          message: `${cartItems.length} new booking(s) received`,
          type: 'booking',
        }));

        await supabase.from('notifications').insert(notifications);
      }

      onCheckout();
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Failed to complete checkout');
    } finally {
      setProcessing(false);
    }
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600">Add services to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-lg text-gray-600">{cartItems.length} item(s)</p>
      </div>

      <div className="space-y-4 mb-24">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md p-6 flex items-start justify-between"
          >
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {item.service_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {item.device_type === 'mobile' ? 'Mobile' : 'Laptop'} - {item.brand_name}{' '}
                    {item.model_name || item.custom_model}
                  </p>
                  <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {item.quality_tier.charAt(0).toUpperCase() + item.quality_tier.slice(1)} Quality
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{Number(item.price).toFixed(2)}</p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">₹{total.toFixed(2)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : 'Book Services'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
