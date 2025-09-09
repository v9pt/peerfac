import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { useRealtime } from './RealtimeProvider';
import {
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  ChevronDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function Navbar({ isAuthenticated, currentUser, onLogin, onLogout, onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();
  const { notifications, onlineUsers, isConnected } = useRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const location = useLocation();

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg glass-dark hover:bg-white/10 transition-all duration-200"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

              <Link to="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-white font-bold text-lg">PF</span>
                  </div>
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 status-pulse"></div>
                  )}
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    PeerFact
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Truth Through Community</p>
                </div>
              </Link>
            </div>

            {/* Center section - Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search claims, users, topics..."
                  className="w-full pl-10 pr-4 py-2 glass rounded-xl border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                  onFocus={() => setShowSearch(true)}
                  onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                />
                
                {showSearch && (
                  <div className="absolute top-full left-0 right-0 mt-2 glass-strong rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-4 space-y-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Popular searches</div>
                    <div className="flex flex-wrap gap-2">
                      {['COVID-19', 'Climate Change', 'Election 2024', 'AI News'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm cursor-pointer hover:bg-blue-500/20 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-3">
              {/* Mobile search */}
              <button className="md:hidden p-2 rounded-lg glass-dark hover:bg-white/10 transition-all duration-200">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* Online users indicator */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 glass rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full status-pulse"></div>
                <span className="text-sm font-medium">{onlineUsers} online</span>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg glass-dark hover:bg-white/10 transition-all duration-200"
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-yellow-400" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-indigo-400" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg glass-dark hover:bg-white/10 transition-all duration-200 relative"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 glass-strong rounded-xl border border-white/20 dark:border-white/10 shadow-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Notifications</h3>
                      <span className="text-xs text-gray-500">{notifications.length} total</span>
                    </div>
                    
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? notifications.slice(0, 5).map(notification => (
                        <div key={notification.id} className="p-3 glass rounded-lg border border-white/10">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Intl.RelativeTimeFormat().format(
                              Math.floor((notification.timestamp - new Date()) / 60000),
                              'minute'
                            )}
                          </p>
                        </div>
                      )) : (
                        <div className="text-center text-gray-500 py-4">
                          No notifications yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Create button */}
              <Link
                to="/create"
                className="btn-gradient text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Link>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg glass-dark hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:inline font-medium">{currentUser?.username}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 glass-strong rounded-xl border border-white/20 dark:border-white/10 shadow-xl py-2">
                      <Link to="/profile" className="block px-4 py-2 hover:bg-white/10 transition-colors">
                        Profile
                      </Link>
                      <Link to="/settings" className="block px-4 py-2 hover:bg-white/10 transition-colors">
                        Settings
                      </Link>
                      <hr className="my-2 border-white/10" />
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors text-red-400"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLogin}
                  className="btn-glass text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-all duration-200"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowSearch(false)}>
          <div className="p-4">
            <div className="glass-strong rounded-xl p-4">
              <input
                type="text"
                placeholder="Search claims, users, topics..."
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-white/10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}