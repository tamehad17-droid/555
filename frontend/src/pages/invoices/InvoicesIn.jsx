import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function InvoicesIn() {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [partners, setPartners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    currency: '',
    customerId: '',
    paymentStatus: ''
  });
  const [formData, setFormData] = useState({
    customerId: '',
    categoryId: '',
    amount: '',
    currency: 'TRY',
    description: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentStatus: 'unpaid',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesRes, partnersRes, categoriesRes] = await Promise.all([
        api.get('/invoices-in', { params: filters }),
        api.get('/partners', { params: { type: 'customer' } }),
        api.get('/categories', { params: { type: 'income' } })
      ]);
      
      setInvoices(invoicesRes.data.data?.invoices || invoicesRes.data.data || []);
      setPartners(partnersRes.data.data?.partners || partnersRes.data.data || []);
      setCategories(categoriesRes.data.data?.categories || categoriesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await api.put(`/invoices-in/${editingInvoice.id}`, formData);
        toast.success('Invoice updated successfully');
      } else {
        await api.post('/invoices-in', formData);
        toast.success('Invoice created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    try {
      await api.delete(`/invoices-in/${id}`);
      toast.success('Invoice deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const openModal = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setFormData({
        customerId: invoice.customer_id || '',
        categoryId: invoice.category_id || '',
        amount: invoice.amount || '',
        currency: invoice.currency || 'TRY',
        description: invoice.description || '',
        invoiceDate: invoice.invoice_date || '',
        dueDate: invoice.due_date || '',
        paymentStatus: invoice.payment_status || 'unpaid',
        paymentMethod: invoice.payment_method || 'cash',
        notes: invoice.notes || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingInvoice(null);
    setFormData({
      customerId: '',
      categoryId: '',
      amount: '',
      currency: 'TRY',
      description: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentStatus: 'unpaid',
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'badge-success',
      partial: 'badge-warning',
      unpaid: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">{t('invoicesIn')}</h1>
          <p className="page-subtitle">Manage income invoices</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          {t('add')} Invoice
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="date"
            placeholder="From Date"
            className="input"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          />
          <input
            type="date"
            placeholder="To Date"
            className="input"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          />
          <select
            className="input"
            value={filters.currency}
            onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
          >
            <option value="">All Currencies</option>
            <option value="TRY">TRY</option>
            <option value="SYP">SYP</option>
            <option value="USD">USD</option>
          </select>
          <select
            className="input"
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5" />
            {t('search')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-12 h-12 mx-auto"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noData')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-mono">{invoice.invoice_number}</td>
                    <td>{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td>{invoice.customer?.name || 'N/A'}</td>
                    <td className="font-bold">{Number(invoice.amount).toLocaleString()}</td>
                    <td>{invoice.currency}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(invoice.payment_status)}`}>
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(invoice)}
                          className="btn-secondary p-2"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">
              {editingInvoice ? 'Edit' : 'Add'} Income Invoice
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Customer *</label>
                  <select
                    className="input"
                    value={formData.customerId}
                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                    required
                  >
                    <option value="">Select Customer</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Currency *</label>
                  <select
                    className="input"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    required
                  >
                    <option value="TRY">TRY - ₺</option>
                    <option value="SYP">SYP - ل.س</option>
                    <option value="USD">USD - $</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Invoice Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Payment Status</label>
                  <select
                    className="input"
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select
                    className="input"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
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
    </div>
  );
}
