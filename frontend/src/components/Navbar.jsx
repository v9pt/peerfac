import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, BellIcon, PlusIcon, UserCircleIcon, MagnifyingGlassIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { sidebarOpen, setSidebarOpen, theme } = useApp();
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b backdrop-blur-sm bg-opacity-95`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            
            <Link to="/" className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center`}>
                <span className="text-white font-bold text-sm">PF</span>
              </div>
              <span className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'} hidden sm:block`}>
                PeerFact
              </span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Search claims, users, topics..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                } border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {!isAuthPage && (
              <>
                <Link
                  to="/create"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span className="hidden sm:block">Create</span>
                </Link>
                
                <button className={`p-2 rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors relative`}>
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={`flex items-center space-x-2 p-2 rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} transition-colors`}
                  >
                    <UserCircleIcon className="w-8 h-8" />
                    {user && (
                      <div className="hidden lg:block">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {user.username}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Rep: {Math.round(user.reputation * 100) / 100}
                          {user.is_anonymous && ' (Guest)'}
                        </div>
                      </div>
                    )}
                  </button>

                  {showUserMenu && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg ${
                      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    } ring-1 ring-black ring-opacity-5 z-50`}>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className={`block px-4 py-2 text-sm ${
                            theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          View Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className={`block px-4 py-2 text-sm ${
                            theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          Settings
                        </Link>
                        
                        {user?.is_anonymous ? (
                          <>
                            <hr className={`my-1 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                            <Link
                              to="/login"
                              onClick={() => setShowUserMenu(false)}
                              className={`block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors`}
                            >
                              Sign In
                            </Link>
                            <Link
                              to="/register"
                              onClick={() => setShowUserMenu(false)}
                              className={`block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors`}
                            >
                              Create Account
                            </Link>
                          </>
                        ) : isAuthenticated && (
                          <>
                            <hr className={`my-1 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                            <button
                              onClick={handleLogout}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                              } transition-colors flex items-center space-x-2`}
                            >
                              <ArrowRightOnRectangleIcon className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {isAuthPage && (
              <div className="flex items-center space-x-4">
                {location.pathname === '/login' ? (
                  <Link
                    to="/register"
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;