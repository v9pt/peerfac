import React, { useState, useEffect } from 'react';
import { TrophyIcon, UserIcon, LinkIcon, StarIcon } from '@heroicons/react/24/outline';
import { useApp } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const LeaderboardPage = () => {
  const { API, theme } = useApp();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'users', name: 'Top Verifiers', icon: UserIcon },
    { id: 'sources', name: 'Reliable Sources', icon: LinkIcon },
  ];

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        const [usersRes, sourcesRes] = await Promise.all([
          axios.get(`${API}/leaderboard/users`),
          axios.get(`${API}/leaderboard/sources`)
        ]);
        setUsers(usersRes.data || []);
        setSources(sourcesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, [API]);

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getReputationColor = (reputation) => {
    if (reputation >= 10) return 'text-purple-600';
    if (reputation >= 5) return 'text-blue-600';
    if (reputation >= 2) return 'text-green-600';
    return 'text-gray-600';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.9) return 'text-green-600';
    if (accuracy >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <TrophyIcon className="w-16 h-16 text-yellow-500" />
        </div>
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Leaderboard
        </h1>
        <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Recognizing our top contributors and most reliable sources
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className={`inline-flex rounded-lg p-1 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Top 3 Users */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {users.slice(0, 3).map((user, index) => (
                  <div
                    key={user.id}
                    className={`relative p-6 rounded-xl border text-center ${
                      index === 0
                        ? theme === 'dark'
                          ? 'bg-gradient-to-b from-yellow-900/20 to-gray-800 border-yellow-500/30'
                          : 'bg-gradient-to-b from-yellow-50 to-white border-yellow-300'
                        : theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                    } transform hover:scale-105 transition-transform`}
                  >
                    {index === 0 && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          Champion
                        </div>
                      </div>
                    )}
                    
                    <div className="text-4xl mb-3">{getRankIcon(index + 1)}</div>
                    
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-400 text-white'
                    }`}>
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user.username}
                    </h3>
                    
                    <div className="mt-4 space-y-2">
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Reputation: <span className={`font-semibold ${getReputationColor(user.reputation)}`}>
                          {user.reputation.toFixed(1)}
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Accuracy: <span className={`font-semibold ${getAccuracyColor(user.accuracy)}`}>
                          {Math.round(user.accuracy * 100)}%
                        </span>
                      </div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Verifications: <span className="font-semibold">{user.verifications}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Remaining Users */}
              <div className={`rounded-xl border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    All Top Verifiers
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.slice(3).map((user, index) => (
                    <div key={user.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-8`}>
                          #{index + 4}
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.username}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.verifications} verifications
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className={`font-semibold ${getReputationColor(user.reputation)}`}>
                            {user.reputation.toFixed(1)}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Reputation
                          </div>
                        </div>
                        <div className="text-center">
                          <div className={`font-semibold ${getAccuracyColor(user.accuracy)}`}>
                            {Math.round(user.accuracy * 100)}%
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Accuracy
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className={`rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Most Reliable Sources
                </h2>
                <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Ranked by community verification alignment
                </p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sources.map((source, index) => (
                  <div key={source.domain} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} w-8`}>
                        #{index + 1}
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        theme === 'dark' ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                      }`}>
                        🔗
                      </div>
                      <div>
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {source.domain}
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {source.samples} samples analyzed
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`font-bold text-lg ${
                          source.reliability >= 0.9 ? 'text-green-600' :
                          source.reliability >= 0.7 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {Math.round(source.reliability * 100)}%
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Reliability
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(source.reliability * 5) 
                                ? 'text-yellow-400 fill-current' 
                                : theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;