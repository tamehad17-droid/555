import { useState, useEffect } from 'react';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function EmployeeForm({ employee, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    email: '',
    phone: '',
    position: '',
    baseSalary: '',
    currency: 'TRY',
    hireDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeCode: employee.employee_code || '',
        fullName: employee.full_name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        position: employee.position || '',
        baseSalary: employee.base_salary || '',
        currency: employee.currency || 'TRY',
        hireDate: employee.hire_date || '',
        status: employee.status || 'active'
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (employee) {
        await api.put(`/employees/${employee.id}`, formData);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', formData);
        toast.success('Employee created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Employee Code *</label>
          <input
            type="text"
            className="input"
            value={formData.employeeCode}
            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Full Name *</label>
          <input
            type="text"
            className="input"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Phone</label>
          <input
            type="tel"
            className="input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Position</label>
          <input
            type="text"
            className="input"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Base Salary *</label>
          <input
            type="number"
            step="0.01"
            className="input"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
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
            <option value="TRY">TRY</option>
            <option value="SYP">SYP</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Hire Date</label>
          <input
            type="date"
            className="input"
            value={formData.hireDate}
            onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="on_leave">On Leave</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}
