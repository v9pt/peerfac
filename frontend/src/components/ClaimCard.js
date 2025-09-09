import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  BookmarkIcon,
  ClockIcon,
  LinkIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolid,
  HandThumbDownIcon as HandThumbDownSolid,
  QuestionMarkCircleIcon as QuestionMarkCircleSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';

export default function ClaimCard({ claim, isAuthenticated, currentUser, onLogin }) {
  const [userVote, setUserVote] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const totalVotes = claim.support_count + claim.refute_count + claim.unclear_count;
  const confidenceColor = claim.confidence >= 0.7 ? 'green' : claim.confidence >= 0.4 ? 'yellow' : 'red';
  
  const getVeracityLabel = () => {
    if (claim.ai_label) return claim.ai_label;
    if (claim.confidence >= 0.7) return 'Likely True';
    if (claim.confidence >= 0.4) return 'Unclear';
    return 'Needs Verification';
  };

  const getVeracityColor = () => {
    const label = getVeracityLabel();
    if (label.includes('True')) return 'text-green-600 dark:text-green-400 bg-green-500/10';
    if (label.includes('False')) return 'text-red-600 dark:text-red-400 bg-red-500/10';
    if (label.includes('Unclear')) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
    return 'text-gray-600 dark:text-gray-400 bg-gray-500/10';
  };

  const handleVote = async (stance) => {
    if (!isAuthenticated) {
      onLogin();
      return;
    }

    try {
      // Implementation would go here
      setUserVote(stance);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="glass rounded-xl border border-white/20 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {claim.author_id?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="font-medium text-sm">Anonymous User</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <ClockIcon className="w-3 h-3" />
                  <span>{formatTimeAgo(claim.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Claim Text */}
            <Link to={`/claim/${claim.id}`} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <p className="text-lg font-medium leading-relaxed mb-3">
                {claim.text}
              </p>
            </Link>

            {/* Link Preview */}
            {claim.link && (
              <div className="flex items-center space-x-2 p-3 bg-white/5 rounded-lg mb-3">
                <LinkIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <a 
                  href={claim.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm truncate"
                >
                  {claim.link}
                </a>
              </div>
            )}

            {/* AI Analysis Badge */}
            {claim.ai_summary && (
              <div className="mb-3">
                <button
                  onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                  className="flex items-center space-x-2 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm hover:bg-purple-500/20 transition-colors"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>AI Analysis Available</span>
                </button>
                
                {showAIAnalysis && (
                  <div className="mt-3 p-4 glass rounded-lg border border-purple-500/20">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">AI Summary</span>
                        <span className="text-xs px-2 py-1 bg-purple-500/20 rounded-full">
                          Confidence: {Math.round((claim.ai_confidence || 0.5) * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {claim.ai_summary}
                      </p>
                      {claim.ai_reasoning && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                            View reasoning
                          </summary>
                          <p className="mt-2 text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-purple-500/30">
                            {claim.ai_reasoning}
                          </p>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Status */}
          <div className="flex flex-col items-end space-y-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getVeracityColor()}`}>
              {getVeracityLabel()}
            </div>
            
            {totalVotes >= 5 && (
              <div className="flex items-center space-x-1">
                {claim.confidence >= 0.8 ? (
                  <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                ) : claim.confidence <= 0.3 ? (
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                ) : null}
                <span className="text-xs text-gray-500">
                  {Math.round(claim.confidence * 100)}% confidence
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voting Section */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Vote Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleVote('support')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                userVote === 'support'
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                  : 'hover:bg-green-500/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              {userVote === 'support' ? (
                <HandThumbUpSolid className="w-4 h-4" />
              ) : (
                <HandThumbUpIcon className="w-4 h-4" />
              )}
              <span className="font-medium">{claim.support_count}</span>
            </button>

            <button
              onClick={() => handleVote('refute')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                userVote === 'refute'
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                  : 'hover:bg-red-500/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              {userVote === 'refute' ? (
                <HandThumbDownSolid className="w-4 h-4" />
              ) : (
                <HandThumbDownIcon className="w-4 h-4" />
              )}
              <span className="font-medium">{claim.refute_count}</span>
            </button>

            <button
              onClick={() => handleVote('unclear')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                userVote === 'unclear'
                  ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                  : 'hover:bg-yellow-500/10 text-gray-600 dark:text-gray-400'
              }`}
            >
              {userVote === 'unclear' ? (
                <QuestionMarkCircleSolid className="w-4 h-4" />
              ) : (
                <QuestionMarkCircleIcon className="w-4 h-4" />
              )}
              <span className="font-medium">{claim.unclear_count}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isBookmarked ? (
                <BookmarkSolid className="w-4 h-4 text-blue-500" />
              ) : (
                <BookmarkIcon className="w-4 h-4 text-gray-400" />
              )}
            </button>

            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ShareIcon className="w-4 h-4 text-gray-400" />
            </button>

            <Link
              to={`/claim/${claim.id}`}
              className="px-3 py-1 text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              Verify →
            </Link>
          </div>
        </div>

        {/* Progress Bar */}
        {totalVotes > 0 && (
          <div className="mt-4">
            <div className="flex text-xs text-gray-500 mb-1">
              <span>Community Consensus</span>
              <span className="ml-auto">{totalVotes} votes</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div 
                  className="bg-green-500"
                  style={{ width: `${(claim.support_count / totalVotes) * 100}%` }}
                ></div>
                <div 
                  className="bg-red-500"
                  style={{ width: `${(claim.refute_count / totalVotes) * 100}%` }}
                ></div>
                <div 
                  className="bg-yellow-500"
                  style={{ width: `${(claim.unclear_count / totalVotes) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}