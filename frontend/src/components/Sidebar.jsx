import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChartBarIcon,
  TrophyIcon,
  UserIcon,
  Cog6ToothIcon,
  XMarkIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useTheme } from './ThemeProvider';

export default function Sidebar({ isOpen, onClose, isAuthenticated, currentUser }) {
  const location = useLocation();
  const { isDark } = useTheme();

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon, emoji: '🏠' },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, emoji: '🔍' },
    { name: 'Create Claim', href: '/create', icon: PlusCircleIcon, emoji: '✨' },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, emoji: '📊' },
    { name: 'Leaderboard', href: '/leaderboard', icon: TrophyIcon, emoji: '🏆' },
  ];

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon, emoji: '👤' },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, emoji: '⚙️' },
  ];

  const stats = [
    { label: 'Claims Created', value: '12', color: 'text-blue-500' },
    { label: 'Verifications', value: '47', color: 'text-green-500' },
    { label: 'Reputation', value: '8.7', color: 'text-purple-500' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 glass border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:h-screen custom-scrollbar overflow-y-auto`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur group-hover:opacity-30 transition-all duration-300"></div>
            </div>
            <span className="text-xl font-bold text-gradient">PeerFact</span>
          </Link>
          
          <button
            onClick={onClose}
            className="lg:hidden glass-button p-2"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* User Section */}
        {isAuthenticated && currentUser && (
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {currentUser.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentUser.username || 'Anonymous'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Level {Math.floor(currentUser.reputation || 1)}
                </p>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-2">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-2 glass rounded-lg">
                  <div className={`text-lg font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="px-4 py-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onClose()}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.name}</span>
                  {isActive(item.href) && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User-specific Navigation */}
          {isAuthenticated && (
            <>
              <div className="mt-8 px-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Account
                </h4>
              </div>
              <div className="space-y-2">
                {userNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => onClose()}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive(item.href)
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <Icon className="h-5 w-5" />
                      <span className="flex-1">{item.name}</span>
                      {isActive(item.href) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* Trending Section */}
        <div className="px-4 py-6 border-t border-white/10 mt-auto">
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center">
              <FireIcon className="h-4 w-4 mr-1 text-orange-500" />
              Trending Now
            </h4>
            <div className="space-y-2">
              {['Climate Data', 'Tech News', 'Health Facts'].map((topic, index) => (
                <div
                  key={topic}
                  className="flex items-center justify-between p-2 glass rounded-lg hover:bg-white/10 cursor-pointer group"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                    #{topic}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.floor(Math.random() * 50) + 10}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <ChartBarIcon className="h-4 w-4 mr-2 text-blue-500" />
              Today's Activity
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">New Claims</span>
                <span className="font-medium text-gray-900 dark:text-white">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Verifications</span>
                <span className="font-medium text-gray-900 dark:text-white">67</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">AI Analyses</span>
                <span className="font-medium text-gray-900 dark:text-white">18</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Made with <HeartIcon className="h-3 w-3 inline text-red-500" /> by the PeerFact team
          </p>
        </div>
      </div>
    </>
  );
}