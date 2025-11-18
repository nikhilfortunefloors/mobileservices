import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase, DeviceBrand, DeviceModel } from '../../lib/supabase';

interface ModelSelectionProps {
  brand: DeviceBrand;
  onSelect: (model: DeviceModel | null, customModel?: string) => void;
  onBack: () => void;
}

export function ModelSelection({ brand, onSelect, onBack }: ModelSelectionProps) {
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customModel, setCustomModel] = useState('');

  useEffect(() => {
    loadModels();
  }, [brand.id]);

  const loadModels = async () => {
    try {
      const { data, error } = await supabase
        .from('device_models')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('is_active', true)
        .order('model_name');

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = () => {
    if (customModel.trim()) {
      onSelect(null, customModel.trim());
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
          Select {brand.brand_name} Model
        </h1>
        <p className="text-lg text-gray-600">Choose your device model</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelect(model)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-800">{model.model_name}</h3>
              </button>
            ))}
          </div>

          {showCustomInput ? (
            <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Model Name</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Enter your model name"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customModel.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
              <button
                onClick={() => setShowCustomInput(false)}
                className="mt-3 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setShowCustomInput(true)}
                className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-800 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Other Model
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
