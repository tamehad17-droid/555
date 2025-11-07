import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register } from '@/store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Register() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    storeName: '',
    username: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
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
      await dispatch(register(formData)).unwrap();
      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="card">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('register')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your store account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="storeName" className="label">
              Store Name
            </label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              required
              className="input"
              value={formData.storeName}
              onChange={handleChange}
            />
          </div>

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
            />
          </div>

          <div>
            <label htmlFor="fullName" className="label">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="input"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              {t('email')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phone" className="label">
              {t('phone')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="input"
              value={formData.phone}
              onChange={handleChange}
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
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? t('loading') : t('register')}
          </button>
        </form>
      </div>
    </div>
  );
}
