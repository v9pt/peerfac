import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  UserIcon, 
  TrophyIcon, 
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../App';
import ClaimCard from '../components/ClaimCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ProfilePage = () => {
  const { userId } = useParams();
  const { user, claims, theme } = useApp();
  const [activeTab, setActiveTab] = useState('claims');
  const [profileUser] = useState(user); // For now, just show current user

  const tabs = [
    { id: 'claims', name: 'My Claims', count: 12 },
    { id: 'verifications', name: 'Verifications', count: 45 },
    { id: 'stats', name: 'Statistics', count: null },
  ];

  const userClaims = claims.filter(claim => claim.author_id === user?.id);
  
  const stats = {
    totalClaims: userClaims.length,
    totalVerifications: 45,
    accuracy: 0.94,
    reputation: user?.reputation || 1.0,
    rank: 23,
    joinDate: user?.created_at || new Date().toISOString(),
  };

  const recentActivity = [
    { type: 'claim', text: 'Posted "New climate data shows..."', time: '3 hours ago' },
    { type: 'verification', text: 'Verified claim about renewable energy', time: '5 hours ago' },
    { type: 'achievement', text: 'Reached 50 verifications milestone', time: '1 day ago' },
    { type: 'verification', text: 'Refuted misinformation about vaccines', time: '2 days ago' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className={`relative overflow-hidden rounded-xl ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        {/* Profile Info */}
        <div className="relative px-8 pb-8">
          <div className="flex items-end space-x-6 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-white p-2 shadow-lg">
                <div className={`w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {profileUser?.username?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1 pb-4">
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {profileUser?.username || 'User'}
              </h1>
              <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Fact-checker since {new Date(stats.joinDate).toLocaleDateString()}
              </p>
              
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Rank #{stats.rank}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5 text-blue-500" />
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {Math.round(stats.accuracy * 100)}% Accuracy
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    R
                  </div>
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {stats.reputation.toFixed(1)} Reputation
                  </span>
                </div>
              </div>
            </div>
            
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              <CogIcon className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Claims Posted', value: stats.totalClaims, color: 'blue', icon: '📝' },
          { label: 'Verifications', value: stats.totalVerifications, color: 'green', icon: '✅' },
          { label: 'Accuracy Rate', value: `${Math.round(stats.accuracy * 100)}%`, color: 'purple', icon: '🎯' },
          { label: 'Reputation', value: stats.reputation.toFixed(1), color: 'orange', icon: '⭐' },
        ].map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } text-center hover:shadow-lg transition-shadow`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {stat.value}
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : theme === 'dark'
                  ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'claims' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                My Claims ({userClaims.length})
              </h2>
            </div>
            
            {userClaims.length === 0 ? (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-lg font-medium">No claims posted yet</p>
                <p className="mt-2">Start by creating your first claim!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {userClaims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} showActions={false} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'verifications' && (
          <div className="space-y-6">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Verifications
            </h2>
            
            <div className="grid gap-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      index % 3 === 0 
                        ? 'bg-green-100 text-green-800' 
                        : index % 3 === 1
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {index % 3 === 0 ? 'SUPPORT' : index % 3 === 1 ? 'REFUTE' : 'UNCLEAR'}
                    </span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {index + 1} days ago
                    </span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Verified claim about {['climate change', 'technology', 'health policy', 'economics', 'science'][index]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Activity Chart */}
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Activity Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Claims this month
                  </span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    8
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Verifications this month
                  </span>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    23
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Average accuracy
                  </span>
                  <span className="font-semibold text-green-600">94.2%</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'claim' ? 'bg-blue-500' :
                      activity.type === 'verification' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {activity.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;