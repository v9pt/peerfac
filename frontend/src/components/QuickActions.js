import React from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function QuickActions({ isAuthenticated, onLogin }) {
  const actions = [
    {
      title: 'Submit Claim',
      description: 'Add a new claim for fact-checking',
      icon: PlusIcon,
      color: 'blue',
      to: '/create',
      requiresAuth: false
    },
    {
      title: 'Verify Claims',
      description: 'Help verify pending claims',
      icon: MagnifyingGlassIcon,
      color: 'green',
      to: '/?filter=unverified',
      requiresAuth: false
    },
    {
      title: 'View Analytics',
      description: 'Explore platform insights',
      icon: ChartBarIcon,
      color: 'purple',
      to: '/analytics',
      requiresAuth: false
    },
    {
      title: 'Join Community',
      description: 'Connect with fact-checkers',
      icon: UserGroupIcon,
      color: 'orange',
      to: '/leaderboard',
      requiresAuth: false
    }
  ];

  const handleActionClick = (action, e) => {
    if (action.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      onLogin();
    }
  };

  return (
    <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center space-x-2">
          <BoltIcon className="w-5 h-5 text-yellow-500" />
          <span>Quick Actions</span>
        </h3>
        {!isAuthenticated && (
          <button
            onClick={onLogin}
            className="text-xs text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign in for more
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <Link
              key={index}
              to={action.to}
              onClick={(e) => handleActionClick(action, e)}
              className={`group p-4 rounded-xl bg-${action.color}-500/5 hover:bg-${action.color}-500/10 border border-${action.color}-500/20 hover:border-${action.color}-500/30 transition-all duration-200 hover:shadow-lg`}
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/10 group-hover:bg-${action.color}-500/20 flex items-center justify-center transition-colors`}>
                  <Icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-current">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Hover effect indicator */}
              <div className={`mt-3 h-1 bg-${action.color}-500/20 rounded-full overflow-hidden`}>
                <div className={`h-full bg-${action.color}-500 rounded-full transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300`}></div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* AI-powered suggestions */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center space-x-2 mb-3">
          <SparklesIcon className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
            AI Suggestions
          </span>
        </div>
        
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              📊 High activity on climate-related claims today
            </p>
            <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mt-1">
              Help verify →
            </button>
          </div>
          
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              🎯 Your expertise could help with tech claims
            </p>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-1">
              View claims →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}