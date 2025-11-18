import { Smartphone, Laptop } from 'lucide-react';

interface DeviceSelectionProps {
  onSelect: (deviceType: 'mobile' | 'laptop') => void;
}

export function DeviceSelection({ onSelect }: DeviceSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Device</h1>
        <p className="text-lg text-gray-600">Select the device you need to repair</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelect('mobile')}
          className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <Smartphone className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Mobile Repair</h2>
            <p className="text-gray-600">Fix your smartphone issues</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('laptop')}
          className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
              <Laptop className="w-12 h-12 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Laptop Repair</h2>
            <p className="text-gray-600">Get your laptop serviced</p>
          </div>
        </button>
      </div>
    </div>
  );
}
