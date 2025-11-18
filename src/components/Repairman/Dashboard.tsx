import { useEffect, useState } from 'react';
import { Package, Clock, Wrench, CheckCircle, Bell } from 'lucide-react';
import { supabase, Booking, Notification } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface BookingWithDetails extends Booking {
  brand_name?: string;
  model_name?: string;
  service_name?: string;
  customer_name?: string;
  customer_phone?: string;
}

export function RepairmanDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadBookings();
      loadNotifications();
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
          profiles:customer_id (full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingsWithDetails = (data || []).map((booking: any) => ({
        ...booking,
        brand_name: booking.device_brands?.brand_name,
        model_name: booking.device_models?.model_name,
        service_name: booking.services?.service_name,
        customer_name: booking.profiles?.full_name,
        customer_phone: booking.profiles?.phone,
      }));

      setBookings(bookingsWithDetails);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const subscribeToUpdates = () => {
    if (!user) return;

    const bookingSubscription = supabase
      .channel('repairman_bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          loadBookings();
        }
      )
      .subscribe();

    const notificationSubscription = supabase
      .channel('repairman_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      bookingSubscription.unsubscribe();
      notificationSubscription.unsubscribe();
    };
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: string,
    assignToSelf?: boolean
  ) => {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (assignToSelf && user) {
        updateData.repairman_id = user.id;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      const booking = bookings.find((b) => b.id === bookingId);
      if (booking) {
        await supabase.from('notifications').insert({
          user_id: booking.customer_id,
          booking_id: bookingId,
          title: 'Booking Status Updated',
          message: `Your booking status has been updated to ${status.replace('_', ' ')}`,
          type: 'status_update',
        });
      }

      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const getStats = () => {
    const myBookings = bookings.filter((b) => b.repairman_id === user?.id);
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      myActive: myBookings.filter((b) =>
        ['confirmed', 'in_progress'].includes(b.status)
      ).length,
      completed: myBookings.filter((b) => b.status === 'completed').length,
    };
  };

  const filteredBookings = bookings.filter((booking) => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'mine') return booking.repairman_id === user?.id;
    return booking.status === selectedStatus;
  });

  const stats = getStats();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Repairman Dashboard</h1>

      {notifications.length > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Notifications</h3>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-blue-800">{notif.title}</p>
                      <p className="text-sm text-blue-700">{notif.message}</p>
                    </div>
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Active</p>
              <p className="text-3xl font-bold text-orange-600">{stats.myActive}</p>
            </div>
            <Wrench className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { value: 'all', label: 'All Bookings' },
            { value: 'mine', label: 'My Bookings' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedStatus === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {booking.service_name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {booking.device_type === 'mobile' ? 'Mobile' : 'Laptop'} - {booking.brand_name}{' '}
                  {booking.model_name || booking.custom_model}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Customer: {booking.customer_name}</span>
                  {booking.customer_phone && <span>Phone: {booking.customer_phone}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">₹{Number(booking.price).toFixed(2)}</p>
                <p className="text-sm text-gray-600">{booking.quality_tier}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              {booking.status === 'pending' && (
                <button
                  onClick={() => updateBookingStatus(booking.id, 'confirmed', true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Accept Order
                </button>
              )}
              {booking.status === 'confirmed' && booking.repairman_id === user?.id && (
                <button
                  onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Start Work
                </button>
              )}
              {booking.status === 'in_progress' && booking.repairman_id === user?.id && (
                <button
                  onClick={() => updateBookingStatus(booking.id, 'completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
