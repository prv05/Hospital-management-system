import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../api/services';
import useAuthStore from '../store/authStore';
import Navbar from '../components/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update auth store
      setAuth(user, accessToken, refreshToken);

      toast.success('Login successful!');

      // Redirect based on role
      const dashboardMap = {
        doctor: '/doctor/dashboard',
        patient: '/patient/dashboard',
        nurse: '/nurse/dashboard',
        admin: '/admin/dashboard',
        billing: '/billing/dashboard',
        pharmacy: '/pharmacy/dashboard',
        lab: '/lab/dashboard',
      };

      navigate(dashboardMap[user.role] || '/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLoginCredentials = [
    { role: 'Admin', email: 'admin@hospital.com', password: 'admin123' },
    { role: 'Doctor', email: 'dr.sharma@hospital.com', password: 'doctor123' },
    { role: 'Patient', email: 'patient1@email.com', password: 'patient123' },
    { role: 'Nurse', email: 'nurse1@hospital.com', password: 'nurse123' },
  ];

  const quickLogin = async (email, password) => {
    // perform immediate login (auto-submit) for quick login buttons
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      // store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // update auth store
      setAuth(user, accessToken, refreshToken);

      toast.success('Quick login successful');

      const dashboardMap = {
        doctor: '/doctor/dashboard',
        patient: '/patient/dashboard',
        nurse: '/nurse/dashboard',
        admin: '/admin/dashboard',
        billing: '/billing/dashboard',
        pharmacy: '/pharmacy/dashboard',
        lab: '/lab/dashboard',
      };

      navigate(dashboardMap[user.role] || '/');
    } catch (error) {
      console.error('Quick login error:', error);
      toast.error(error.response?.data?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="card">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Login to Your Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Register here
                </Link>
              </p>
            </div>

            {/* Quick Login for Testing */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                Quick Login (For Testing)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickLoginCredentials.map((cred, index) => (
                  <button
                    key={index}
                    onClick={() => quickLogin(cred.email, cred.password)}
                    className="text-xs px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {cred.role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
