import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import toast from 'react-hot-toast';
import {
  BuildingStorefrontIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function SystemDashboard() {
  const { t } = useTranslation();
  const [stores, setStores] = useState([]);
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    suspendedStores: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    ownerUsername: '',
    ownerFullName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
    subscriptionPlan: 'free',
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stores');
      const storesData = res.data.data.stores || [];
      setStores(storesData);

      setStats({
        totalStores: storesData.length,
        activeStores: storesData.filter(s => s.status === 'active').length,
        suspendedStores: storesData.filter(s => s.status === 'suspended').length,
        totalRevenue: storesData.reduce((sum, s) => {
          const prices = { monthly: 5, '6months': 30, yearly: 40 };
          return sum + (prices[s.subscription_plan] || 0);
        }, 0),
      });
    } catch (error) {
      toast.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stores', formData);
      toast.success('Store created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchStores();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to create store');
    }
  };

  const handleApproveSubscription = async (storeId, plan) => {
    try {
      await api.put(`/stores/${storeId}/subscription`, {
        subscriptionPlan: plan,
      });
      toast.success('Subscription approved');
      fetchStores();
    } catch (error) {
      toast.error('Failed to approve subscription');
    }
  };

  const handleToggleStatus = async (storeId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.put(`/stores/${storeId}/status`, { status: newStatus });
      toast.success(`Store ${newStatus}`);
      fetchStores();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      storeName: '',
      ownerUsername: '',
      ownerFullName: '',
      ownerEmail: '',
      ownerPassword: '',
      ownerPhone: '',
      subscriptionPlan: 'free',
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      suspended: 'badge-danger',
      expired: 'badge-warning',
      cancelled: 'badge-info',
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">System Administration</h1>
          <p className="page-subtitle">Manage stores and subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Store
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stats-card">
          <div>
            <p className="stats-label">Total Stores</p>
            <p className="stats-value text-blue-600">{stats.totalStores}</p>
          </div>
          <BuildingStorefrontIcon className="w-12 h-12 text-blue-600 opacity-20" />
        </div>
        <div className="stats-card">
          <div>
            <p className="stats-label">Active Stores</p>
            <p className="stats-value text-green-600">{stats.activeStores}</p>
          </div>
          <CheckCircleIcon className="w-12 h-12 text-green-600 opacity-20" />
        </div>
        <div className="stats-card">
          <div>
            <p className="stats-label">Suspended</p>
            <p className="stats-value text-red-600">{stats.suspendedStores}</p>
          </div>
          <XCircleIcon className="w-12 h-12 text-red-600 opacity-20" />
        </div>
        <div className="stats-card">
          <div>
            <p className="stats-label">Monthly Revenue</p>
            <p className="stats-value text-purple-600">${stats.totalRevenue}</p>
          </div>
          <UsersIcon className="w-12 h-12 text-purple-600 opacity-20" />
        </div>
      </div>

      {/* Stores Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">All Stores</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-12 h-12 mx-auto"></div>
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No stores yet. Create your first store above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Owner</th>
                  <th>Email</th>
                  <th>Subscription</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="font-semibold">{store.name}</td>
                    <td>{store.owner?.full_name || 'N/A'}</td>
                    <td>{store.contact_email}</td>
                    <td>
                      <span className="badge badge-info">
                        {store.subscription_plan.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {store.subscription_end_date
                        ? new Date(store.subscription_end_date).toLocaleDateString()
                        : new Date(store.trial_end_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(store.status)}`}>
                        {store.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(store.id, store.status)}
                          className={`btn-${store.status === 'active' ? 'danger' : 'success'} p-2 text-xs`}
                          title={store.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          {store.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <select
                          className="input p-2 text-xs"
                          onChange={(e) => handleApproveSubscription(store.id, e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>Upgrade</option>
                          <option value="monthly">Monthly ($5)</option>
                          <option value="6months">6 Months ($30)</option>
                          <option value="yearly">Yearly ($40)</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Create New Store</h2>
            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="label">Store Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Owner Username *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.ownerUsername}
                    onChange={(e) => setFormData({ ...formData, ownerUsername: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Owner Full Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.ownerFullName}
                    onChange={(e) => setFormData({ ...formData, ownerFullName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Password *</label>
                  <input
                    type="password"
                    className="input"
                    value={formData.ownerPassword}
                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="label">Subscription Plan</label>
                  <select
                    className="input"
                    value={formData.subscriptionPlan}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                  >
                    <option value="free">Free Trial (30 days)</option>
                    <option value="monthly">Monthly ($5)</option>
                    <option value="6months">6 Months ($30)</option>
                    <option value="yearly">Yearly ($40)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
