import { useEffect, useState } from 'react';
import { Settings, Package, Users, Image } from 'lucide-react';
import { supabase, Service, PromotionalCard } from '../../lib/supabase';
import { ServiceManager } from './ServiceManager';
import { PromotionalCardManager } from './PromotionalCardManager';

type ActiveTab = 'overview' | 'services' | 'promotions';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalCustomers: 0,
    totalRepairmen: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [bookingsRes, profilesRes] = await Promise.all([
        supabase.from('bookings').select('price, customer_id'),
        supabase.from('profiles').select('role'),
      ]);

      const bookings = bookingsRes.data || [];
      const profiles = profilesRes.data || [];

      const uniqueCustomers = new Set(bookings.map((b) => b.customer_id)).size;
      const repairmen = profiles.filter((p) => p.role === 'repairman').length;
      const revenue = bookings.reduce((sum, b) => sum + Number(b.price), 0);

      setStats({
        totalBookings: bookings.length,
        totalCustomers: uniqueCustomers,
        totalRepairmen: repairmen,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'services':
        return <ServiceManager />;
      case 'promotions':
        return <PromotionalCardManager />;
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <Package className="w-12 h-12 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
                    </div>
                    <Users className="w-12 h-12 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Repairmen</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalRepairmen}</p>
                    </div>
                    <Users className="w-12 h-12 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{stats.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <Settings className="w-12 h-12 text-blue-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="bg-white rounded-xl shadow-md p-2 mb-8 inline-flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Settings className="w-5 h-5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'services'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Package className="w-5 h-5" />
          Services
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'promotions'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Image className="w-5 h-5" />
          Promotions
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
