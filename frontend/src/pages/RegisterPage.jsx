import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, isAuthenticated } = useAuth();
  const { theme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    
    if (!username || !email || !password || !confirmPassword) {
      return 'Please fill in all fields';
    }
    
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, hyphens, and underscores';
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Please enter a valid email address';
    }
    
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    
    if (!/[A-Za-z]/.test(password)) {
      return 'Password must contain at least one letter';
    }
    
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    
    const { loginAsAnonymous } = useAuth();
    const result = await loginAsAnonymous();
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-blue-600">
            <span className="text-white font-bold text-xl">PF</span>
          </div>
          <h2 className={`mt-6 text-center text-3xl font-extrabold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Create your PeerFact account
          </h2>
          <p className={`mt-2 text-center text-sm ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full px-12 py-3 border ${
                    theme === 'dark'
                      ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Username"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full px-12 py-3 border ${
                    theme === 'dark'
                      ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Email address"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full px-12 py-3 border ${
                    theme === 'dark'
                      ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} transition-colors`}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`appearance-none rounded-lg relative block w-full px-12 py-3 border ${
                    theme === 'dark'
                      ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Confirm password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} transition-colors`}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-without transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'
                }`}>
                  Or continue as
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAnonymousLogin}
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border text-sm font-medium rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-gray-700 text-gray-300 bg-gray-800 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Continue as Guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;