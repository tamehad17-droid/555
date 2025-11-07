import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('invoices');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    try {
      setLoading(true);
      const params = { dateFrom, dateTo };
      if (currency !== 'all') params.currency = currency;

      const response = await api.get(`/reports/${reportType}`, { params });
      setReportData(response.data.data);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${reportType.toUpperCase()} Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Period: ${dateFrom} to ${dateTo}`, 14, 30);

    let tableData = [];
    let headers = [];

    if (reportType === 'invoices') {
      headers = [['Date', 'Type', 'Number', 'Partner', 'Amount', 'Currency', 'Status']];
      tableData = (reportData.invoices || []).map(inv => [
        new Date(inv.invoice_date).toLocaleDateString(),
        inv.type,
        inv.invoice_number,
        inv.partner?.name || '',
        inv.total_amount,
        inv.currency,
        inv.payment_status,
      ]);
    } else if (reportType === 'inventory') {
      headers = [['SKU', 'Name', 'Stock', 'Min', 'Max', 'Unit Price', 'Currency']];
      tableData = (reportData.items || []).map(item => [
        item.sku,
        item.name,
        item.current_stock,
        item.min_stock,
        item.max_stock,
        item.unit_price,
        item.currency,
      ]);
    } else if (reportType === 'payroll') {
      headers = [['Employee', 'Month', 'Base', 'Bonuses', 'Deductions', 'Net', 'Status']];
      tableData = (reportData.payrolls || []).map(pay => [
        pay.employee?.full_name || '',
        new Date(pay.month).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        pay.base_salary,
        pay.bonuses,
        pay.deductions,
        pay.base_salary + pay.bonuses - pay.deductions,
        pay.status,
      ]);
    }

    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`${reportType}_report_${dateFrom}_${dateTo}.pdf`);
    toast.success('PDF exported successfully');
  };

  const exportToExcel = () => {
    if (!reportData) return;

    let sheetData = [];

    if (reportType === 'invoices') {
      sheetData = (reportData.invoices || []).map(inv => ({
        Date: new Date(inv.invoice_date).toLocaleDateString(),
        Type: inv.type,
        Number: inv.invoice_number,
        Partner: inv.partner?.name || '',
        Amount: inv.total_amount,
        Currency: inv.currency,
        Status: inv.payment_status,
      }));
    } else if (reportType === 'inventory') {
      sheetData = (reportData.items || []).map(item => ({
        SKU: item.sku,
        Name: item.name,
        'Current Stock': item.current_stock,
        'Min Stock': item.min_stock,
        'Max Stock': item.max_stock,
        'Unit Price': item.unit_price,
        Currency: item.currency,
      }));
    } else if (reportType === 'payroll') {
      sheetData = (reportData.payrolls || []).map(pay => ({
        Employee: pay.employee?.full_name || '',
        Month: new Date(pay.month).toLocaleDateString('en', { month: 'short', year: 'numeric' }),
        'Base Salary': pay.base_salary,
        Bonuses: pay.bonuses,
        Deductions: pay.deductions,
        'Net Salary': pay.base_salary + pay.bonuses - pay.deductions,
        Status: pay.status,
      }));
    }

    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);
    XLSX.writeFile(wb, `${reportType}_report_${dateFrom}_${dateTo}.xlsx`);
    toast.success('Excel exported successfully');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Generate and export business reports</p>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Report Type</label>
            <select
              className="input"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="invoices">Invoices (In/Out)</option>
              <option value="inventory">Inventory</option>
              <option value="payroll">Payroll</option>
              <option value="financial">Financial Summary</option>
            </select>
          </div>
          <div>
            <label className="label">From Date</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label">To Date</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <select
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="all">All Currencies</option>
              <option value="TRY">TRY (₺)</option>
              <option value="SYP">SYP (ل.س)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={generateReport}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {reportData && (
            <>
              <button
                onClick={exportToPDF}
                className="btn-info flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Export PDF
              </button>
              <button
                onClick={exportToExcel}
                className="btn-success flex items-center gap-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Export Excel
              </button>
            </>
          )}
        </div>
      </div>

      {reportData && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Report Preview</h2>
          <div className="overflow-x-auto">
            {reportType === 'invoices' && (
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Number</th>
                    <th>Partner</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.invoices || []).map((inv, idx) => (
                    <tr key={idx}>
                      <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                      <td><span className={`badge ${inv.type === 'in' ? 'badge-success' : 'badge-danger'}`}>{inv.type}</span></td>
                      <td>{inv.invoice_number}</td>
                      <td>{inv.partner?.name}</td>
                      <td className="font-semibold">{inv.total_amount} {inv.currency}</td>
                      <td><span className={`badge badge-${inv.payment_status === 'paid' ? 'success' : 'warning'}`}>{inv.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'inventory' && (
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Unit Price</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-mono">{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.current_stock} {item.unit_type}</td>
                      <td>{item.unit_price} {item.currency}</td>
                      <td className="font-semibold">{(item.current_stock * item.unit_price).toFixed(2)} {item.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'payroll' && (
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Month</th>
                    <th>Base</th>
                    <th>Bonuses</th>
                    <th>Deductions</th>
                    <th>Net</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(reportData.payrolls || []).map((pay, idx) => (
                    <tr key={idx}>
                      <td>{pay.employee?.full_name}</td>
                      <td>{new Date(pay.month).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</td>
                      <td>{pay.base_salary}</td>
                      <td className="text-green-600">+{pay.bonuses}</td>
                      <td className="text-red-600">-{pay.deductions}</td>
                      <td className="font-bold">{pay.base_salary + pay.bonuses - pay.deductions} {pay.currency}</td>
                      <td><span className={`badge badge-${pay.status === 'paid' ? 'success' : 'warning'}`}>{pay.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
