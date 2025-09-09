import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  ClockIcon,
  UserIcon,
  LinkIcon,
  CheckBadgeIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function ClaimCard({ claim, isAuthenticated, onLogin, onLike, onShare }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLike = () => {
    if (!isAuthenticated) {
      onLogin();
      return;
    }
    setIsLiked(!isLiked);
    onLike?.(claim.id);
  };

  const handleShare = () => {
    onShare?.(claim);
  };

  const getStatusIcon = (label) => {
    switch (label?.toLowerCase()) {
      case 'mostly true':
      case 'likely true':
        return <CheckBadgeIcon className="h-5 w-5 text-green-400" />;
      case 'mostly false':
      case 'likely false':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <QuestionMarkCircleIcon className="h-5 w-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'mostly true':
      case 'likely true':
        return 'status-true';
      case 'mostly false':
      case 'likely false':
        return 'status-false';
      default:
        return 'status-unclear';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="glass-card hover-lift hover-glow group cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              Anonymous User
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              <span>{formatTimeAgo(claim.created_at)}</span>
            </div>
          </div>
        </div>

        {/* AI Analysis Status */}
        {claim.ai_label && (
          <div className={`status-badge ${getStatusColor(claim.ai_label)} flex items-center space-x-1`}>
            {getStatusIcon(claim.ai_label)}
            <span className="text-xs font-medium">{claim.ai_label}</span>
          </div>
        )}
      </div>

      {/* Claim Content */}
      <div className="mb-4">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
          {isExpanded ? claim.text : truncateText(claim.text)}
          {claim.text.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-500 hover:text-blue-400 ml-2 text-sm font-medium"
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </p>

        {/* Link Preview */}
        {claim.link && (
          <div className="mt-3 p-3 glass rounded-lg border border-white/10">
            <div className="flex items-center space-x-2 text-sm text-blue-400">
              <LinkIcon className="h-4 w-4" />
              <a 
                href={claim.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline truncate"
              >
                {claim.link}
              </a>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {claim.ai_summary && (
          <div className="mt-3 p-3 glass rounded-lg border border-blue-500/20 bg-blue-500/5">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs text-white font-bold">AI</span>
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {claim.ai_summary}
                </p>
                {claim.ai_confidence && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Confidence:</span>
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                        style={{ width: `${(claim.ai_confidence * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(claim.ai_confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Stats */}
      <div className="flex items-center justify-between mb-4 p-3 glass rounded-lg">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1 text-green-400">
            <CheckBadgeIcon className="h-4 w-4" />
            <span>{claim.support_count || 0}</span>
          </div>
          <div className="flex items-center space-x-1 text-red-400">
            <XCircleIcon className="h-4 w-4" />
            <span>{claim.refute_count || 0}</span>
          </div>
          <div className="flex items-center space-x-1 text-yellow-400">
            <QuestionMarkCircleIcon className="h-4 w-4" />
            <span>{claim.unclear_count || 0}</span>
          </div>
        </div>
        
        {claim.confidence !== undefined && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(claim.confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 glass-button py-2 px-3 text-sm ${
              isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {isLiked ? (
              <HeartSolidIcon className="h-4 w-4" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
            <span>Like</span>
          </button>

          <Link
            to={`/claim/${claim.id}`}
            className="flex items-center space-x-2 glass-button py-2 px-3 text-sm text-gray-600 dark:text-gray-400"
          >
            <ChatBubbleLeftIcon className="h-4 w-4" />
            <span>Verify</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 glass-button py-2 px-3 text-sm text-gray-600 dark:text-gray-400"
          >
            <ShareIcon className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        <Link
          to={`/claim/${claim.id}`}
          className="flex items-center space-x-1 text-blue-500 hover:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300"
        >
          <EyeIcon className="h-4 w-4" />
          <span>View Details</span>
          <ChevronRightIcon className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}