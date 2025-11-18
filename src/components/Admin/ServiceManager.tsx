import { useEffect, useState } from 'react';
import { Plus, Edit2, Save, X } from 'lucide-react';
import { supabase, Service } from '../../lib/supabase';

export function ServiceManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    device_type: 'common' as 'mobile' | 'laptop' | 'common',
    normal_price: '',
    premium_price: '',
    other_price: '',
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('service_name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase.from('services').insert({
        ...formData,
        normal_price: parseFloat(formData.normal_price),
        premium_price: parseFloat(formData.premium_price),
        other_price: parseFloat(formData.other_price),
      });

      if (error) throw error;

      setFormData({
        service_name: '',
        description: '',
        device_type: 'common',
        normal_price: '',
        premium_price: '',
        other_price: '',
      });
      setShowAddForm(false);
      loadServices();
    } catch (error) {
      console.error('Error adding service:', error);
      alert('Failed to add service');
    }
  };

  const handleUpdate = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          service_name: service.service_name,
          description: service.description,
          device_type: service.device_type,
          normal_price: service.normal_price,
          premium_price: service.premium_price,
          other_price: service.other_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', service.id);

      if (error) throw error;
      setEditingId(null);
      loadServices();
    } catch (error) {
      console.error('Error updating service:', error);
      alert('Failed to update service');
    }
  };

  const toggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) throw error;
      loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      alert('Failed to update service status');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Type
              </label>
              <select
                value={formData.device_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    device_type: e.target.value as 'mobile' | 'laptop' | 'common',
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="common">Common</option>
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Normal Price (₹)
              </label>
              <input
                type="number"
                value={formData.normal_price}
                onChange={(e) => setFormData({ ...formData, normal_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Price (₹)
              </label>
              <input
                type="number"
                value={formData.premium_price}
                onChange={(e) => setFormData({ ...formData, premium_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Price (₹)
              </label>
              <input
                type="number"
                value={formData.other_price}
                onChange={(e) => setFormData({ ...formData, other_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Service
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-md p-6">
            {editingId === service.id ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={service.service_name}
                      onChange={(e) =>
                        setServices(
                          services.map((s) =>
                            s.id === service.id ? { ...s, service_name: e.target.value } : s
                          )
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Normal Price</label>
                    <input
                      type="number"
                      value={service.normal_price}
                      onChange={(e) =>
                        setServices(
                          services.map((s) =>
                            s.id === service.id
                              ? { ...s, normal_price: parseFloat(e.target.value) }
                              : s
                          )
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Premium Price</label>
                    <input
                      type="number"
                      value={service.premium_price}
                      onChange={(e) =>
                        setServices(
                          services.map((s) =>
                            s.id === service.id
                              ? { ...s, premium_price: parseFloat(e.target.value) }
                              : s
                          )
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Other Price</label>
                    <input
                      type="number"
                      value={service.other_price}
                      onChange={(e) =>
                        setServices(
                          services.map((s) =>
                            s.id === service.id
                              ? { ...s, other_price: parseFloat(e.target.value) }
                              : s
                          )
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(service)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {service.service_name}
                  </h3>
                  {service.description && (
                    <p className="text-gray-600 mb-3">{service.description}</p>
                  )}
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600">
                      Device: <span className="font-medium">{service.device_type}</span>
                    </span>
                    <span className="text-gray-600">
                      Normal: <span className="font-medium">₹{service.normal_price}</span>
                    </span>
                    <span className="text-gray-600">
                      Premium: <span className="font-medium">₹{service.premium_price}</span>
                    </span>
                    <span className="text-gray-600">
                      Other: <span className="font-medium">₹{service.other_price}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingId(service.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleActive(service.id, service.is_active)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      service.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {service.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
