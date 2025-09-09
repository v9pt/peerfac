import React from 'react';
import {
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

export default function ActivityFeed({ updates }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'verification':
        return CheckCircleIcon;
      case 'claim':
        return ExclamationCircleIcon;
      case 'user':
        return UserIcon;
      case 'source':
        return LinkIcon;
      default:
        return ClockIcon;
    }
  };

  const getActivityColor = (message) => {
    if (message.includes('TRUE') || message.includes('verified')) return 'green';
    if (message.includes('FALSE') || message.includes('flagged')) return 'red';
    if (message.includes('joined') || message.includes('updated')) return 'blue';
    return 'gray';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(timestamp)) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full status-pulse"></div>
          <span>Live Activity</span>
        </h3>
        <span className="text-xs text-gray-500">{updates.length} recent</span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {updates.length > 0 ? updates.slice(0, 10).map((update) => {
          const Icon = getActivityIcon(update.type);
          const color = getActivityColor(update.message);
          
          return (
            <div
              key={update.id}
              className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className={`p-1.5 rounded-full bg-${color}-500/10 group-hover:bg-${color}-500/20 transition-colors flex-shrink-0`}>
                <Icon className={`w-3 h-3 text-${color}-600 dark:text-${color}-400`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {update.message}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                  <ClockIcon className="w-3 h-3" />
                  <span>{formatTimeAgo(update.timestamp)}</span>
                </p>
              </div>
            </div>
          );
        }) : (
          <div className="text-center text-gray-500 py-6">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">Check back soon for live updates</p>
          </div>
        )}
      </div>

      {/* Activity pulse indicator */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span>Real-time updates active</span>
        </div>
      </div>
    </div>
  );
}