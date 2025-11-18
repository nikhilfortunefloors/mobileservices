import { useEffect, useState } from 'react';
import { Smartphone, Laptop, ShoppingCart, Package } from 'lucide-react';
import { supabase, PromotionalCard } from '../../lib/supabase';

interface HomeProps {
  onStartBooking: () => void;
  onViewCart: () => void;
  onViewBookings: () => void;
}

export function Home({ onStartBooking, onViewCart, onViewBookings }: HomeProps) {
  const [promoCards, setPromoCards] = useState<PromotionalCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPromoCards();
  }, []);

  const loadPromoCards = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_cards')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPromoCards(data || []);
    } catch (error) {
      console.error('Error loading promotional cards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Device Repair Services
          </h1>
          <p className="text-xl text-gray-600">
            Fast, reliable repairs for your mobile and laptop devices
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={onStartBooking}
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Book Service</h2>
              <p className="text-gray-600 text-center">Start a new repair booking</p>
            </div>
          </button>

          <button
            onClick={onViewCart}
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">View Cart</h2>
              <p className="text-gray-600 text-center">Check your cart items</p>
            </div>
          </button>

          <button
            onClick={onViewBookings}
            className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">My Bookings</h2>
              <p className="text-gray-600 text-center">Track your orders</p>
            </div>
          </button>
        </div>

        {promoCards.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Special Offers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {promoCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  {card.image_url && (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                    {card.description && (
                      <p className="text-gray-600">{card.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Service</h3>
              <p className="text-gray-600">Quick turnaround time for all repairs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Parts</h3>
              <p className="text-gray-600">Original and premium quality components</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fair Pricing</h3>
              <p className="text-gray-600">Transparent and competitive prices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
