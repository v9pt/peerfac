import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon, 
  SunIcon, 
  MoonIcon,
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useTheme } from './ThemeProvider';

export default function Navbar({ isAuthenticated, currentUser, onLogin, onLogout, onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Explore', href: '/explore', icon: '🔍' },
    { name: 'Create Claim', href: '/create', icon: '✨' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden glass-button p-2"
            >
              <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur group-hover:opacity-30 transition-all duration-300"></div>
              </div>
              <span className="text-2xl font-bold text-gradient hidden sm:block">
                PeerFact
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claims, topics, users..."
                className="glass-input pl-10 pr-4 py-2 text-sm"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === item.href
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              <div className="theme-toggle-handle">
                {isDark ? (
                  <MoonIcon className="h-4 w-4 text-gray-600" />
                ) : (
                  <SunIcon className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </button>

            {/* Notifications - Only if authenticated */}
            {isAuthenticated && (
              <button className="glass-button p-2 relative">
                <BellIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>
            )}

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 glass-button">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentUser?.username || 'Anonymous'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 rounded-lg mx-2"
                    >
                      👤 Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/10 rounded-lg mx-2"
                    >
                      ⚙️ Settings
                    </Link>
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg mx-2"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="glass-button gradient-primary text-white hover:shadow-xl hover:shadow-blue-500/25"
              >
                <UserCircleIcon className="h-4 w-4 mr-2" />
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden glass-button p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden glass rounded-xl m-4 p-4 space-y-2">
            {/* Mobile Search */}
            <div className="md:hidden mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="glass-input pl-10 pr-4 py-2 text-sm w-full"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
                  location.pathname === item.href
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white/10'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}