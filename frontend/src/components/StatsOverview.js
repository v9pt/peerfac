import React from 'react';
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  TrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function StatsOverview({ stats }) {
  const statCards = [
    {
      title: 'Total Claims',
      value: stats.totalClaims || 0,
      change: '+12%',
      changeType: 'increase',
      icon: DocumentTextIcon,
      color: 'blue',
      description: 'Claims submitted today'
    },
    {
      title: 'Verified Claims',
      value: stats.verifiedClaims || 0,
      change: '+8%',
      changeType: 'increase',
      icon: ShieldCheckIcon,
      color: 'green',
      description: 'High confidence ratings'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers || 0,
      change: '+15%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'purple',
      description: 'Online right now'
    },
    {
      title: 'Accuracy Rate',
      value: `${stats.accuracyRate || 0}%`,
      change: '+3%',
      changeType: 'increase',
      icon: ChartBarIcon,
      color: 'orange',
      description: 'Community precision'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div
            key={index}
            className="glass rounded-xl p-6 border border-white/20 dark:border-white/10 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/10 group-hover:bg-${stat.color}-500/20 transition-colors`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stat.changeType === 'increase' 
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <TrendingUpIcon className="w-3 h-3" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Mini chart visualization */}
            <div className="mt-4 h-8 flex items-end space-x-1">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 bg-${stat.color}-500/20 rounded-sm transition-all duration-300 group-hover:bg-${stat.color}-500/40`}
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 50}ms`
                  }}
                ></div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}