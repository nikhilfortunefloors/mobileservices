import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, Plus } from 'lucide-react';
import { supabase, Service, DeviceBrand, DeviceModel } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface ServiceSelectionProps {
  deviceType: 'mobile' | 'laptop';
  brand: DeviceBrand;
  model: DeviceModel | null;
  customModel?: string;
  onBack: () => void;
  onAddToCart: () => void;
}

export function ServiceSelection({
  deviceType,
  brand,
  model,
  customModel,
  onBack,
  onAddToCart,
}: ServiceSelectionProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTier, setSelectedTier] = useState<'normal' | 'premium' | 'other'>('normal');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadServices();
  }, [deviceType]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .in('device_type', [deviceType, 'common'])
        .eq('is_active', true)
        .order('service_name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedService || !user) return;

    setAdding(true);
    try {
      const price = selectedTier === 'normal'
        ? selectedService.normal_price
        : selectedTier === 'premium'
        ? selectedService.premium_price
        : selectedService.other_price;

      const { error } = await supabase
        .from('cart_items')
        .insert({
          customer_id: user.id,
          device_type: deviceType,
          brand_id: brand.id,
          model_id: model?.id || null,
          custom_model: customModel || null,
          service_id: selectedService.id,
          quality_tier: selectedTier,
          price,
        });

      if (error) throw error;
      onAddToCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const getPrice = (service: Service) => {
    switch (selectedTier) {
      case 'normal':
        return service.normal_price;
      case 'premium':
        return service.premium_price;
      case 'other':
        return service.other_price;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Select Service</h1>
        <p className="text-lg text-gray-600">
          {brand.brand_name} {model?.model_name || customModel}
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Quality Tier</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedTier('normal')}
            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              selectedTier === 'normal'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setSelectedTier('premium')}
            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              selectedTier === 'premium'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            Premium
          </button>
          <button
            onClick={() => setSelectedTier('other')}
            className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
              selectedTier === 'other'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            Other
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-xl shadow-md p-6 transition-all cursor-pointer ${
                selectedService?.id === service.id
                  ? 'ring-2 ring-blue-600 shadow-lg'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedService(service)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {service.service_name}
                  </h3>
                  {service.description && (
                    <p className="text-gray-600 mb-3">{service.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{getPrice(service).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedService && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selected Service</p>
              <p className="font-semibold text-gray-900">{selectedService.service_name}</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? (
                'Adding...'
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
