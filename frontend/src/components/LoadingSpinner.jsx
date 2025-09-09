import React from 'react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer Ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-blue-500/20 animate-spin`}>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
        </div>
        
        {/* Inner Glow Effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-sm pulse-glow`}></div>
      </div>
    </div>
  );
}

export function FullPageLoader({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card text-center max-w-sm">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function InlineLoader({ message = 'Loading...', size = 'md' }) {
  return (
    <div className="flex items-center justify-center space-x-3 py-8">
      <LoadingSpinner size={size} />
      <span className="text-gray-600 dark:text-gray-400">{message}</span>
    </div>
  );
}