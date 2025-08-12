import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  TrophyIcon, 
  UserIcon, 
  Cog6ToothIcon,
  InformationCircleIcon,
  ChartBarIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../App';

const Sidebar = () => {
  const { sidebarOpen, theme } = useApp();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: HomeIcon, label: 'Home', description: 'Latest claims' },
    { path: '/explore', icon: MagnifyingGlassIcon, label: 'Explore', description: 'Discover trending' },
    { path: '/leaderboard', icon: TrophyIcon, label: 'Leaderboard', description: 'Top contributors' },
    { path: '/profile', icon: UserIcon, label: 'Profile', description: 'Your activity' },
  ];

  const secondaryItems = [
    { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
    { path: '/about', icon: InformationCircleIcon, label: 'About' },
  ];

  const trendingTopics = [
    { name: 'Climate Change', count: 142, trend: 'up' },
    { name: 'Technology', count: 89, trend: 'up' },
    { name: 'Politics', count: 67, trend: 'down' },
    { name: 'Health', count: 45, trend: 'up' },
    { name: 'Science', count: 34, trend: 'stable' },
  ];

  return (
    <aside className={`fixed left-0 top-16 bottom-0 z-40 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-r overflow-y-auto scrollbar-hide`}>
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group ${
                location.pathname === item.path
                  ? theme === 'dark'
                    ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                  : theme === 'dark'
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.label}</div>
                  {item.description && (
                    <div className={`text-xs ${
                      location.pathname === item.path 
                        ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                        : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* Trending Topics */}
        {sidebarOpen && (
          <div className="space-y-3">
            <div className={`flex items-center space-x-2 px-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <FireIcon className="w-5 h-5" />
              <span className="font-semibold text-sm">Trending Topics</span>
            </div>
            <div className="space-y-2">
              {trendingTopics.map((topic, index) => (
                <div
                  key={topic.name}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } cursor-pointer transition-colors`}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} truncate`}>
                      #{topic.name}
                    </div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {topic.count} claims
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {topic.trend === 'up' && (
                      <ChartBarIcon className="w-4 h-4 text-green-500" />
                    )}
                    {topic.trend === 'down' && (
                      <ChartBarIcon className="w-4 h-4 text-red-500 transform rotate-180" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="space-y-2">
            {secondaryItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? theme === 'dark'
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-6 h-6 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        {sidebarOpen && (
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'} space-y-2`}>
            <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Platform Stats
            </div>
            <div className="space-y-1 text-xs">
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Total Claims</span>
                <span className="font-medium">2,847</span>
              </div>
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Verified Today</span>
                <span className="font-medium text-green-500">127</span>
              </div>
              <div className={`flex justify-between ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <span>Active Users</span>
                <span className="font-medium">1,593</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;