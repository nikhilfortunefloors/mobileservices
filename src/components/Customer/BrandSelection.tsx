import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase, DeviceBrand } from '../../lib/supabase';

interface BrandSelectionProps {
  deviceType: 'mobile' | 'laptop';
  onSelect: (brand: DeviceBrand) => void;
  onBack: () => void;
}

export function BrandSelection({ deviceType, onSelect, onBack }: BrandSelectionProps) {
  const [brands, setBrands] = useState<DeviceBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, [deviceType]);

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('device_brands')
        .select('*')
        .eq('device_type', deviceType)
        .eq('is_active', true)
        .order('brand_name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
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

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Select {deviceType === 'mobile' ? 'Mobile' : 'Laptop'} Brand
        </h1>
        <p className="text-lg text-gray-600">Choose your device brand</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onSelect(brand)}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <h3 className="text-lg font-semibold text-gray-800">{brand.brand_name}</h3>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
