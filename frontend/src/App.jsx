import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { getCurrentUser } from './store/slices/authSlice';
import { setTheme } from './store/slices/themeSlice';
import { setLocale } from './store/slices/localeSlice';

// Layout
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import SystemDashboard from './pages/admin/SystemDashboard';
import InvoicesIn from './pages/invoices/InvoicesIn';
import InvoicesOut from './pages/invoices/InvoicesOut';
import Inventory from './pages/inventory/Inventory';
import Employees from './pages/employees/Employees';
import Payroll from './pages/payroll/Payroll';
import Partners from './pages/partners/Partners';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import SubscriptionExpired from './pages/subscription/SubscriptionExpired';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-16 h-16"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Guest Route Component (redirect if authenticated)
const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { token } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const locale = useSelector((state) => state.locale.current);

  // Initialize theme
  useEffect(() => {
    dispatch(setTheme(theme));
  }, []);

  // Initialize locale
  useEffect(() => {
    dispatch(setLocale(locale));
  }, []);

  // Get current user on mount if token exists
  useEffect(() => {
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [token, dispatch]);

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </GuestRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="admin" element={<SystemDashboard />} />
        <Route path="invoices-in" element={<InvoicesIn />} />
        <Route path="invoices-out" element={<InvoicesOut />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="employees" element={<Employees />} />
        <Route path="payroll" element={<Payroll />} />
        <Route path="partners" element={<Partners />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Subscription Expired */}
      <Route path="/subscription-expired" element={<SubscriptionExpired />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
