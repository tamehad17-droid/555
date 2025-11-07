import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { PlusIcon, BanknotesIcon } from '@heroicons/react/24/outline';

export default function Payroll() {
  const { t } = useTranslation();
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().toISOString().slice(0, 7),
    base_salary: '',
    bonuses: '',
    deductions: '',
    currency: 'TRY',
    payment_date: '',
    status: 'pending',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payrollRes, employeesRes] = await Promise.all([
        api.get('/payroll'),
        api.get('/employees'),
      ]);
      setPayrolls(payrollRes.data.data.payrolls || []);
      setEmployees(employeesRes.data.data.employees || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        bonuses: parseFloat(formData.bonuses) || 0,
        deductions: parseFloat(formData.deductions) || 0,
      };
      await api.post('/payroll', dataToSend);
      toast.success('Payroll record created');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed');
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await api.put(`/payroll/${id}`, { status: 'paid', payment_date: new Date().toISOString().split('T')[0] });
      toast.success('Marked as paid');
      fetchData();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      month: new Date().toISOString().slice(0, 7),
      base_salary: '',
      bonuses: '',
      deductions: '',
      currency: 'TRY',
      payment_date: '',
      status: 'pending',
      notes: '',
    });
  };

  const calculateNet = (base, bonuses, deductions) => {
    const b = parseFloat(base) || 0;
    const bon = parseFloat(bonuses) || 0;
    const ded = parseFloat(deductions) || 0;
    return b + bon - ded;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      paid: 'badge-success',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-info';
  };

  const handleEmployeeSelect = (e) => {
    const empId = e.target.value;
    const emp = employees.find(e => e.id === empId);
    setFormData({
      ...formData,
      employee_id: empId,
      base_salary: emp?.salary || '',
      currency: emp?.currency || 'TRY',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Manage employee salaries and payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Payroll
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="spinner w-12 h-12 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Month</th>
                  <th>Base Salary</th>
                  <th>Bonuses</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Payment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.id}>
                    <td className="font-semibold">{payroll.employee?.full_name || 'N/A'}</td>
                    <td>{new Date(payroll.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
                    <td>{payroll.base_salary?.toLocaleString()} {payroll.currency}</td>
                    <td className="text-green-600">+{payroll.bonuses?.toLocaleString() || 0}</td>
                    <td className="text-red-600">-{payroll.deductions?.toLocaleString() || 0}</td>
                    <td className="font-bold">
                      {calculateNet(payroll.base_salary, payroll.bonuses, payroll.deductions).toLocaleString()} {payroll.currency}
                    </td>
                    <td>{payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(payroll.status)}`}>
                        {payroll.status}
                      </span>
                    </td>
                    <td>
                      {payroll.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(payroll.id)}
                          className="btn-success p-2 text-xs flex items-center gap-1"
                        >
                          <BanknotesIcon className="w-4 h-4" />
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payrolls.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No payroll records yet
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Create Payroll Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Employee *</label>
                  <select
                    className="input"
                    value={formData.employee_id}
                    onChange={handleEmployeeSelect}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Month *</label>
                  <input
                    type="month"
                    className="input"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Base Salary *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.base_salary}
                    onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select
                    className="input"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="TRY">TRY (₺)</option>
                    <option value="SYP">SYP (ل.س)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Bonuses</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.bonuses}
                    onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="label">Deductions</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="label">Net Salary</label>
                <div className="text-2xl font-bold text-green-600">
                  {calculateNet(formData.base_salary, formData.bonuses, formData.deductions).toLocaleString()} {formData.currency}
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
