import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../App';

const ClaimCard = ({ claim, onVote, showActions = true }) => {
  const { theme } = useApp();
  const [isVoting, setIsVoting] = useState(false);

  const getVerificationIcon = (label) => {
    if (!label) return <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500" />;
    
    if (label.toLowerCase().includes('true')) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }
    if (label.toLowerCase().includes('false')) {
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
    return <QuestionMarkCircleIcon className="w-5 h-5 text-yellow-500" />;
  };

  const getVerificationColor = (label) => {
    if (!label) return 'gray';
    if (label.toLowerCase().includes('true')) return 'green';
    if (label.toLowerCase().includes('false')) return 'red';
    return 'yellow';
  };

  const handleVote = async (stance) => {
    if (isVoting || !onVote) return;
    setIsVoting(true);
    try {
      await onVote(claim.id, stance);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = (claim.support_count || 0) + (claim.refute_count || 0) + (claim.unclear_count || 0);
  const confidencePercentage = Math.round((claim.confidence || 0) * 100);

  return (
    <div className={`rounded-xl p-6 transition-all duration-200 hover:shadow-lg border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
        : 'bg-white border-gray-200 hover:border-gray-300'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getVerificationIcon(claim.ai_label)}
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getVerificationColor(claim.ai_label) === 'green' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : getVerificationColor(claim.ai_label) === 'red'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : getVerificationColor(claim.ai_label) === 'yellow'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {claim.ai_label || 'Unverified'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{new Date(claim.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <EyeIcon className="w-4 h-4" />
            <span>{totalVotes}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <Link to={`/claim/${claim.id}`} className="block group">
        <h3 className={`text-lg font-semibold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {claim.ai_summary || claim.text}
        </h3>
        
        {claim.text !== claim.ai_summary && claim.ai_summary && (
          <p className={`text-sm mb-4 line-clamp-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {claim.text}
          </p>
        )}
      </Link>

      {/* Link Preview */}
      {claim.link && (
        <div className={`mb-4 p-3 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <a 
            href={claim.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:text-blue-700 text-sm truncate block"
          >
            🔗 {claim.link}
          </a>
        </div>
      )}

      {/* Verification Stats */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Community Confidence: {confidencePercentage}%
          </span>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {totalVotes} verifications
          </span>
        </div>
        
        <div className={`w-full h-2 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
            style={{ width: `${confidencePercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-green-600">Support: {claim.support_count || 0}</span>
          <span className="text-yellow-600">Unclear: {claim.unclear_count || 0}</span>
          <span className="text-red-600">Refute: {claim.refute_count || 0}</span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleVote('support')}
              disabled={isVoting}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-green-50 text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span>Support</span>
            </button>
            
            <button
              onClick={() => handleVote('refute')}
              disabled={isVoting}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-50 text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              <ArrowDownIcon className="w-4 h-4" />
              <span>Refute</span>
            </button>
            
            <button
              onClick={() => handleVote('unclear')}
              disabled={isVoting}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
            >
              <QuestionMarkCircleIcon className="w-4 h-4" />
              <span>Unclear</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link
              to={`/claim/${claim.id}`}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>Discuss</span>
            </Link>
            
            <button className={`p-1.5 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}>
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimCard;