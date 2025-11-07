import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  HomeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CubeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  const isSystemOwner = user?.role?.slug === 'system_owner';

  const navigation = [
    { name: t('dashboard'), href: '/', icon: HomeIcon },
    ...(isSystemOwner ? [
      { name: 'System Admin', href: '/admin', icon: ShieldCheckIcon },
    ] : []),
    { name: t('invoicesIn'), href: '/invoices-in', icon: ArrowDownTrayIcon },
    { name: t('invoicesOut'), href: '/invoices-out', icon: ArrowUpTrayIcon },
    { name: t('inventory'), href: '/inventory', icon: CubeIcon },
    { name: t('employees'), href: '/employees', icon: UsersIcon },
    { name: t('payroll'), href: '/payroll', icon: CurrencyDollarIcon },
    { name: t('reports'), href: '/reports', icon: DocumentTextIcon },
    { name: t('settings'), href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('appName')}
          </h1>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  ${
                    isActive
                      ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <item.icon className="ml-3 w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
