import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/themeSlice';
import { setLocale } from '@/store/slices/localeSlice';
import { MoonIcon, SunIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.mode);
  const locale = useSelector((state) => state.locale.current);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLocaleChange = (newLocale) => {
    dispatch(setLocale(newLocale));
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('welcome')}, {user?.fullName || user?.username}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <select
              value={locale}
              onChange={(e) => handleLocaleChange(e.target.value)}
              className="input py-2"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>

            {/* Theme Toggle */}
            <button onClick={handleThemeToggle} className="btn-secondary p-2">
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Logout */}
            <button onClick={handleLogout} className="btn-danger flex items-center gap-2">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
