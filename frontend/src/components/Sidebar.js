import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PlusIcon,
  ChartBarIcon,
  TrophyIcon,
  UserIcon,
  CogIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  FireIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  PlusIcon as PlusSolid,
  ChartBarIcon as ChartBarSolid,
  TrophyIcon as TrophySolid,
  UserIcon as UserSolid,
  CogIcon as CogSolid
} from '@heroicons/react/24/solid';

export default function Sidebar({ isOpen, onClose, isAuthenticated, currentUser }) {
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeSolid,
      description: 'Latest claims and activity',
      badge: null
    },
    {
      name: 'Submit Claim',
      href: '/create',
      icon: PlusIcon,
      iconSolid: PlusSolid,
      description: 'Add new claim for verification',
      badge: null
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      iconSolid: ChartBarSolid,
      description: 'Platform insights and trends',
      badge: 'New'
    },
    {
      name: 'Leaderboard',
      href: '/leaderboard',
      icon: TrophyIcon,
      iconSolid: TrophySolid,
      description: 'Top contributors and sources',
      badge: null
    }
  ];

  const userItems = isAuthenticated ? [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      iconSolid: UserSolid,
      description: 'Your reputation and activity',
      badge: null
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: CogIcon,
      iconSolid: CogSolid,
      description: 'Preferences and privacy',
      badge: null
    }
  ] : [];

  const quickFilters = [
    {
      name: 'Recent Claims',
      href: '/?filter=recent',
      icon: DocumentTextIcon,
      color: 'blue',
      count: 12
    },
    {
      name: 'Verified',
      href: '/?filter=verified',
      icon: ShieldCheckIcon,
      color: 'green',
      count: 8
    },
    {
      name: 'Controversial',
      href: '/?filter=controversial',
      icon: ExclamationTriangleIcon,
      color: 'red',
      count: 4
    },
    {
      name: 'Trending',
      href: '/?filter=trending',
      icon: FireIcon,
      color: 'orange',
      count: 6
    }
  ];

  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/' && !location.search;
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full glass-strong border-r border-white/20 dark:border-white/10 overflow-y-auto">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PF</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">PeerFact</h2>
                  <p className="text-xs text-gray-500">Navigation</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            {isAuthenticated && currentUser && (
              <div className="mb-6 p-3 glass rounded-xl border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {currentUser.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {currentUser.username}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Reputation: {currentUser.reputation || 1.0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Main Navigation
              </div>
              
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                const Icon = isActive ? item.iconSolid : item.icon;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                        : 'hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    {item.badge && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Filters */}
            <div className="mt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Quick Filters
              </div>
              <div className="space-y-1">
                {quickFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = location.search.includes(`filter=${filter.href.split('=')[1]}`);
                  
                  return (
                    <Link
                      key={filter.name}
                      to={filter.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? `bg-${filter.color}-500/20 text-${filter.color}-600 dark:text-${filter.color}-400`
                          : 'hover:bg-white/5 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{filter.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive
                          ? `bg-${filter.color}-500/30`
                          : 'bg-gray-500/20'
                      }`}>
                        {filter.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Items */}
            {userItems.length > 0 && (
              <div className="mt-6">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Account
                </div>
                <div className="space-y-2">
                  {userItems.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    const Icon = isActive ? item.iconSolid : item.icon;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={`group flex items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                            : 'hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-transparent'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom section */}
            <div className="mt-8 pt-4 border-t border-white/10">
              <div className="text-xs text-gray-500 text-center">
                <p>© 2024 PeerFact</p>
                <p className="mt-1">Community-driven fact-checking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}