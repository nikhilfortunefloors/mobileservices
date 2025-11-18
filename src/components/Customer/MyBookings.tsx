import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { supabase, Booking } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface BookingWithDetails extends Booking {
  brand_name?: string;
  model_name?: string;
  service_name?: string;
  repairman_name?: string;
}

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBookings();
      subscribeToUpdates();
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          device_brands:brand_id (brand_name),
          device_models:model_id (model_name),
          services:service_id (service_name),
          profiles:repairman_id (full_name)
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsWithDetails = (data || []).map((booking: any) => ({
        ...booking,
        brand_name: booking.device_brands?.brand_name,
        model_name: booking.device_models?.model_name,
        service_name: booking.services?.service_name,
        repairman_name: booking.profiles?.full_name,
      }));

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    if (!user) return;

    const subscription = supabase
      .channel('booking_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `customer_id=eq.${user.id}`,
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'in_progress':
        return <Wrench className="w-6 h-6 text-orange-600" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No bookings yet</h2>
          <p className="text-gray-600">Your service bookings will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {getStatusIcon(booking.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {booking.service_name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {booking.device_type === 'mobile' ? 'Mobile' : 'Laptop'} -{' '}
                        {booking.brand_name} {booking.model_name || booking.custom_model}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quality</p>
                      <p className="font-medium text-gray-800">
                        {booking.quality_tier.charAt(0).toUpperCase() +
                          booking.quality_tier.slice(1)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Price</p>
                      <p className="font-medium text-gray-800">₹{Number(booking.price).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Booked On</p>
                      <p className="font-medium text-gray-800">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {booking.repairman_name && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Repairman</p>
                        <p className="font-medium text-gray-800">{booking.repairman_name}</p>
                      </div>
                    )}
                  </div>

                  {booking.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
