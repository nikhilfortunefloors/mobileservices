import { useEffect, useState } from 'react';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { supabase, PromotionalCard } from '../../lib/supabase';

export function PromotionalCardManager() {
  const [cards, setCards] = useState<PromotionalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const { data, error } = await supabase
        .from('promotional_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error loading promotional cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const { error } = await supabase.from('promotional_cards').insert(formData);

      if (error) throw error;

      setFormData({
        title: '',
        description: '',
        image_url: '',
      });
      setShowAddForm(false);
      loadCards();
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add promotional card');
    }
  };

  const handleUpdate = async (card: PromotionalCard) => {
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .update({
          title: card.title,
          description: card.description,
          image_url: card.image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', card.id);

      if (error) throw error;
      setEditingId(null);
      loadCards();
    } catch (error) {
      console.error('Error updating card:', error);
      alert('Failed to update promotional card');
    }
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this promotional card?')) return;

    try {
      const { error } = await supabase
        .from('promotional_cards')
        .delete()
        .eq('id', cardId);

      if (error) throw error;
      loadCards();
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete promotional card');
    }
  };

  const toggleActive = async (cardId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotional_cards')
        .update({ is_active: !currentStatus })
        .eq('id', cardId);

      if (error) throw error;
      loadCards();
    } catch (error) {
      console.error('Error toggling card status:', error);
      alert('Failed to update card status');
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
        <h2 className="text-2xl font-bold text-gray-900">Promotional Cards</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Card
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Promotional Card</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter card title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Enter description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL (from Pexels)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://images.pexels.com/..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add Card
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {editingId === card.id ? (
              <div className="p-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) =>
                      setCards(
                        cards.map((c) => (c.id === card.id ? { ...c, title: e.target.value } : c))
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Title"
                  />
                  <textarea
                    value={card.description || ''}
                    onChange={(e) =>
                      setCards(
                        cards.map((c) =>
                          c.id === card.id ? { ...c, description: e.target.value } : c
                        )
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Description"
                  />
                  <input
                    type="url"
                    value={card.image_url || ''}
                    onChange={(e) =>
                      setCards(
                        cards.map((c) =>
                          c.id === card.id ? { ...c, image_url: e.target.value } : c
                        )
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Image URL"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleUpdate(card)}
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
              <>
                {card.image_url && (
                  <img
                    src={card.image_url}
                    alt={card.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{card.title}</h3>
                  {card.description && (
                    <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(card.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(card.id, card.is_active)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        card.is_active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {card.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        {cards.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No promotional cards yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
