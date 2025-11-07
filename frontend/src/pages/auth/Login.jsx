import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(login(formData)).unwrap();
      toast.success(t('welcome'));
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('appName')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('login')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="label">
              {t('username')}
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="input"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              {t('password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="alert-danger">
              {error.message || 'Login failed'}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner w-5 h-5 mr-2"></div>
                {t('loading')}
              </div>
            ) : (
              t('login')
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="text-primary-600 dark:text-primary-400 hover:underline"
            >
              {t('register')}
            </Link>
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>{t('contactUs')}</p>
        <div className="flex justify-center gap-4 mt-2">
          <a
            href="mailto:systemibrahem@gmail.com"
            className="hover:text-primary-600"
          >
            systemibrahem@gmail.com
          </a>
          <a href="tel:+963994054027" className="hover:text-primary-600">
            +963 994 054 027
          </a>
        </div>
      </div>
    </div>
  );
}
