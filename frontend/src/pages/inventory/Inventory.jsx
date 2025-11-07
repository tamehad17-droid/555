import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function Inventory() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unit: 'piece',
    costPrice: '',
    sellingPrice: '',
    currency: 'TRY',
    currentStock: 0,
    minStock: 10,
    maxStock: '',
    location: ''
  });
  const [movementData, setMovementData] = useState({
    type: 'in',
    quantity: '',
    unitPrice: '',
    notes: ''
  });

  useEffect(() => {
    fetchItems();
  }, [searchTerm]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory/items', { params: { search: searchTerm } });
      setItems(res.data.data?.items || res.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/inventory/items/${editingItem.id}`, formData);
        toast.success('Item updated successfully');
      } else {
        await api.post('/inventory/items', formData);
        toast.success('Item created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleMovement = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventory/movements', {
        ...movementData,
        itemId: selectedItem.id,
        currency: selectedItem.currency
      });
      toast.success('Movement recorded successfully');
      setShowMovementModal(false);
      resetMovementForm();
      fetchItems();
    } catch (error) {
      toast.error('Failed to record movement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/inventory/items/${id}`);
      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        sku: item.sku || '',
        name: item.name || '',
        description: item.description || '',
        unit: item.unit || 'piece',
        costPrice: item.cost_price || '',
        sellingPrice: item.selling_price || '',
        currency: item.currency || 'TRY',
        currentStock: item.current_stock || 0,
        minStock: item.min_stock || 10,
        maxStock: item.max_stock || '',
        location: item.location || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const openMovementModal = (item) => {
    setSelectedItem(item);
    resetMovementForm();
    setShowMovementModal(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      unit: 'piece',
      costPrice: '',
      sellingPrice: '',
      currency: 'TRY',
      currentStock: 0,
      minStock: 10,
      maxStock: '',
      location: ''
    });
  };

  const resetMovementForm = () => {
    setMovementData({
      type: 'in',
      quantity: '',
      unitPrice: '',
      notes: ''
    });
  };

  const isLowStock = (item) => item.current_stock <= item.min_stock;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">{t('inventory')}</h1>
          <p className="page-subtitle">Manage inventory items and stock</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <input
          type="text"
          placeholder="Search by SKU or name..."
          className="input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-12 h-12 mx-auto"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t('noData')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Unit</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={isLowStock(item) ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                    <td className="font-mono">{item.sku}</td>
                    <td className="font-semibold">{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{item.cost_price} {item.currency}</td>
                    <td>{item.selling_price} {item.currency}</td>
                    <td>
                      <span className={`font-bold ${isLowStock(item) ? 'text-red-600' : 'text-green-600'}`}>
                        {item.current_stock}
                      </span>
                    </td>
                    <td>
                      {isLowStock(item) ? (
                        <span className="badge-danger flex items-center gap-1 w-fit">
                          <ExclamationTriangleIcon className="w-4 h-4" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="badge-success">In Stock</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openMovementModal(item)}
                          className="btn-primary p-2"
                          title="Record Movement"
                        >
                          <ArrowUpIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal(item)}
                          className="btn-secondary p-2"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn-danger p-2"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">
              {editingItem ? 'Edit' : 'Add'} Inventory Item
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">SKU *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Unit *</label>
                  <select
                    className="input"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="liter">Liter</option>
                    <option value="box">Box</option>
                    <option value="meter">Meter</option>
                  </select>
                </div>
                <div>
                  <label className="label">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="label">Currency</label>
                  <select
                    className="input"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="TRY">TRY</option>
                    <option value="SYP">SYP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <label className="label">Current Stock</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Min Stock</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Max Stock</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.maxStock}
                    onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Warehouse location"
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowMovementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">
              Record Stock Movement - {selectedItem.name}
            </h2>
            <form onSubmit={handleMovement} className="space-y-4">
              <div>
                <label className="label">Movement Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="in"
                      checked={movementData.type === 'in'}
                      onChange={(e) => setMovementData({ ...movementData, type: e.target.value })}
                    />
                    <ArrowUpIcon className="w-5 h-5 text-green-600" />
                    Stock In (Receive)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="out"
                      checked={movementData.type === 'out'}
                      onChange={(e) => setMovementData({ ...movementData, type: e.target.value })}
                    />
                    <ArrowDownIcon className="w-5 h-5 text-red-600" />
                    Stock Out (Issue)
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={movementData.quantity}
                    onChange={(e) => setMovementData({ ...movementData, quantity: e.target.value })}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current stock: {selectedItem.current_stock} {selectedItem.unit}
                  </p>
                </div>
                <div>
                  <label className="label">Unit Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={movementData.unitPrice}
                    onChange={(e) => setMovementData({ ...movementData, unitPrice: e.target.value })}
                    placeholder={selectedItem.cost_price}
                  />
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows="3"
                  value={movementData.notes}
                  onChange={(e) => setMovementData({ ...movementData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button type="button" onClick={() => setShowMovementModal(false)} className="btn-secondary">
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  Record Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
