import { useState } from 'react';
import { DeviceSelection } from './DeviceSelection';
import { BrandSelection } from './BrandSelection';
import { ModelSelection } from './ModelSelection';
import { ServiceSelection } from './ServiceSelection';
import { Cart } from './Cart';
import { MyBookings } from './MyBookings';
import { Home } from './Home';
import { DeviceBrand, DeviceModel } from '../../lib/supabase';

type View = 'home' | 'device' | 'brand' | 'model' | 'service' | 'cart' | 'bookings';

export function CustomerPortal() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedDeviceType, setSelectedDeviceType] = useState<'mobile' | 'laptop' | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<DeviceBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [customModel, setCustomModel] = useState<string | undefined>(undefined);

  const handleDeviceSelect = (deviceType: 'mobile' | 'laptop') => {
    setSelectedDeviceType(deviceType);
    setCurrentView('brand');
  };

  const handleBrandSelect = (brand: DeviceBrand) => {
    setSelectedBrand(brand);
    setCurrentView('model');
  };

  const handleModelSelect = (model: DeviceModel | null, custom?: string) => {
    setSelectedModel(model);
    setCustomModel(custom);
    setCurrentView('service');
  };

  const handleAddToCart = () => {
    setCurrentView('device');
    setSelectedDeviceType(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setCustomModel(undefined);
  };

  const handleCheckout = () => {
    setCurrentView('bookings');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Home
            onStartBooking={() => setCurrentView('device')}
            onViewCart={() => setCurrentView('cart')}
            onViewBookings={() => setCurrentView('bookings')}
          />
        );
      case 'device':
        return <DeviceSelection onSelect={handleDeviceSelect} />;
      case 'brand':
        return selectedDeviceType ? (
          <BrandSelection
            deviceType={selectedDeviceType}
            onSelect={handleBrandSelect}
            onBack={() => setCurrentView('device')}
          />
        ) : null;
      case 'model':
        return selectedBrand ? (
          <ModelSelection
            brand={selectedBrand}
            onSelect={handleModelSelect}
            onBack={() => setCurrentView('brand')}
          />
        ) : null;
      case 'service':
        return selectedDeviceType && selectedBrand ? (
          <ServiceSelection
            deviceType={selectedDeviceType}
            brand={selectedBrand}
            model={selectedModel}
            customModel={customModel}
            onBack={() => setCurrentView('model')}
            onAddToCart={handleAddToCart}
          />
        ) : null;
      case 'cart':
        return <Cart onCheckout={handleCheckout} />;
      case 'bookings':
        return <MyBookings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentView !== 'home' && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentView('home')}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                Device Repair
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentView('cart')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Cart
                </button>
                <button
                  onClick={() => setCurrentView('bookings')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  My Bookings
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      {renderView()}
    </div>
  );
}
