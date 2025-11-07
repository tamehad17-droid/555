import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import api from '@/services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  BanknotesIcon,
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    inventoryItems: 0,
    employees: 0,
    lowStockItems: 0,
    pendingPayroll: 0,
  });
  const [chartData, setChartData] = useState({
    monthly: { labels: [], income: [], expenses: [] },
    byCategory: { labels: [], values: [] },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard');
      const data = response.data.data;
      
      setStats({
        totalIncome: data.totalIncome || 0,
        totalExpenses: data.totalExpenses || 0,
        inventoryItems: data.inventoryItems || 0,
        employees: data.employees || 0,
        lowStockItems: data.lowStockItems || 0,
        pendingPayroll: data.pendingPayroll || 0,
      });

      // Monthly data for line chart
      if (data.monthlyData) {
        setChartData(prev => ({
          ...prev,
          monthly: {
            labels: data.monthlyData.map(m => m.month),
            income: data.monthlyData.map(m => m.income),
            expenses: data.monthlyData.map(m => m.expenses),
          },
        }));
      }

      // Category data for doughnut
      if (data.expensesByCategory) {
        setChartData(prev => ({
          ...prev,
          byCategory: {
            labels: data.expensesByCategory.map(c => c.category),
            values: data.expensesByCategory.map(c => c.total),
          },
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: chartData.monthly.labels,
    datasets: [
      {
        label: 'Income',
        data: chartData.monthly.income,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Expenses',
        data: chartData.monthly.expenses,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const doughnutData = {
    labels: chartData.byCategory.labels,
    datasets: [
      {
        data: chartData.byCategory.values,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Welcome, {user?.full_name || 'User'}!</h1>
        <p className="page-subtitle">Here's what's happening with your business today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats-card">
          <div>
            <p className="stats-label">Total Income</p>
            <p className="stats-value text-green-600">
              {loading ? '...' : stats.totalIncome.toLocaleString()}
            </p>
          </div>
          <BanknotesIcon className="w-12 h-12 text-green-600 opacity-20" />
        </div>

        <div className="stats-card">
          <div>
            <p className="stats-label">Total Expenses</p>
            <p className="stats-value text-red-600">
              {loading ? '...' : stats.totalExpenses.toLocaleString()}
            </p>
          </div>
          <ShoppingCartIcon className="w-12 h-12 text-red-600 opacity-20" />
        </div>

        <div className="stats-card">
          <div>
            <p className="stats-label">Inventory Items</p>
            <p className="stats-value text-blue-600">
              {loading ? '...' : stats.inventoryItems}
            </p>
            {stats.lowStockItems > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {stats.lowStockItems} items low stock!
              </p>
            )}
          </div>
          <CubeIcon className="w-12 h-12 text-blue-600 opacity-20" />
        </div>

        <div className="stats-card">
          <div>
            <p className="stats-label">Employees</p>
            <p className="stats-value text-purple-600">
              {loading ? '...' : stats.employees}
            </p>
            {stats.pendingPayroll > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                {stats.pendingPayroll} pending payroll
              </p>
            )}
          </div>
          <UsersIcon className="w-12 h-12 text-purple-600 opacity-20" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card">
          <h2 className="text-xl font-bold mb-4">Income vs Expenses (Last 6 Months)</h2>
          <div style={{ height: '300px' }}>
            {chartData.monthly.labels.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Expenses by Category</h2>
          <div style={{ height: '300px' }}>
            {chartData.byCategory.labels.length > 0 ? (
              <Doughnut data={doughnutData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/invoices-in" className="btn-primary text-center">
            New Income Invoice
          </a>
          <a href="/invoices-out" className="btn-danger text-center">
            New Expense Invoice
          </a>
          <a href="/inventory" className="btn-info text-center">
            Manage Inventory
          </a>
          <a href="/reports" className="btn-secondary text-center">
            Generate Report
          </a>
        </div>
      </div>
    </div>
  );
}
