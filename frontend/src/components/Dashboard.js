import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRealtime } from './RealtimeProvider';
import ClaimCard from './ClaimCard';
import ActivityFeed from './ActivityFeed';
import TrendingTopics from './TrendingTopics';
import StatsOverview from './StatsOverview';
import QuickActions from './QuickActions';
import {
  ChartBarIcon,
  FireIcon,
  ClockIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

export default function Dashboard({ isAuthenticated, currentUser, onLogin }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('recent'); // recent, trending, verified, controversial
  const [stats, setStats] = useState({
    totalClaims: 0,
    verifiedClaims: 0,
    activeUsers: 0,
    accuracyRate: 0
  });
  const { realtimeUpdates, onlineUsers } = useRealtime();

  useEffect(() => {
    fetchClaims();
    fetchStats();
  }, [filter]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/claims`);
      const data = await response.json();
      
      // Apply filtering and sorting
      let filteredClaims = [...data];
      
      switch (filter) {
        case 'trending':
          filteredClaims.sort((a, b) => 
            (b.support_count + b.refute_count + b.unclear_count) - 
            (a.support_count + a.refute_count + a.unclear_count)
          );
          break;
        case 'verified':
          filteredClaims = filteredClaims.filter(claim => 
            claim.confidence > 0.7 && 
            (claim.support_count + claim.refute_count + claim.unclear_count) >= 3
          );
          break;
        case 'controversial':
          filteredClaims = filteredClaims.filter(claim => 
            Math.abs(claim.support_count - claim.refute_count) <= 2 &&
            (claim.support_count + claim.refute_count) >= 4
          );
          break;
        default: // recent
          filteredClaims.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      
      setClaims(filteredClaims);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Simulate stats calculation (in real app, this would be a backend endpoint)
      const totalClaims = claims.length;
      const verifiedClaims = claims.filter(c => c.confidence > 0.7).length;
      const accuracyRate = verifiedClaims > 0 ? (verifiedClaims / totalClaims) * 100 : 0;
      
      setStats({
        totalClaims,
        verifiedClaims,
        activeUsers: onlineUsers,
        accuracyRate: Math.round(accuracyRate)
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterOptions = [
    { key: 'recent', label: 'Recent', icon: ClockIcon, color: 'blue' },
    { key: 'trending', label: 'Trending', icon: FireIcon, color: 'orange' },
    { key: 'verified', label: 'Verified', icon: CheckBadgeIcon, color: 'green' },
    { key: 'controversial', label: 'Controversial', icon: ExclamationTriangleIcon, color: 'red' }
  ];

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Fact-Check Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Discover truth through community verification • {onlineUsers} users online
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              to="/analytics"
              className="btn-glass px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/20 transition-all duration-200"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
            <Link
              to="/create"
              className="btn-gradient text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Submit Claim
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Claims Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Tabs */}
            <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map(option => {
                  const Icon = option.icon;
                  const isActive = filter === option.key;
                  
                  return (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? `bg-${option.color}-500/20 text-${option.color}-600 dark:text-${option.color}-400 border border-${option.color}-500/30`
                          : 'hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{option.label}</span>
                      {option.key === 'trending' && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {Math.floor(Math.random() * 20) + 5}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Claims List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass rounded-xl p-6 border border-white/20 dark:border-white/10 animate-pulse">
                      <div className="h-4 bg-white/20 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-white/20 rounded w-1/2 mb-4"></div>
                      <div className="flex space-x-4">
                        <div className="h-8 bg-white/20 rounded w-20"></div>
                        <div className="h-8 bg-white/20 rounded w-20"></div>
                        <div className="h-8 bg-white/20 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : claims.length > 0 ? (
                claims.map(claim => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    isAuthenticated={isAuthenticated}
                    currentUser={currentUser}
                    onLogin={onLogin}
                  />
                ))
              ) : (
                <div className="glass rounded-xl p-8 border border-white/20 dark:border-white/10 text-center">
                  <EyeIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No claims found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {filter === 'verified' && 'No verified claims yet. '}
                    {filter === 'controversial' && 'No controversial claims at the moment. '}
                    Be the first to submit a claim for fact-checking!
                  </p>
                  <Link
                    to="/create"
                    className="btn-gradient text-white px-6 py-2 rounded-lg font-medium inline-block hover:shadow-lg transition-all duration-200"
                  >
                    Submit First Claim
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions isAuthenticated={isAuthenticated} onLogin={onLogin} />
            
            {/* Trending Topics */}
            <TrendingTopics />
            
            {/* Real-time Activity Feed */}
            <ActivityFeed updates={realtimeUpdates} />
            
            {/* Community Leaderboard Preview */}
            <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Top Contributors</h3>
                <Link to="/leaderboard" className="text-blue-500 hover:text-blue-600 text-sm">
                  View all
                </Link>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: 'FactChecker_Pro', score: 98.5, badge: '🥇' },
                  { name: 'TruthSeeker42', score: 94.2, badge: '🥈' },
                  { name: 'VerifyBot', score: 91.8, badge: '🥉' }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{user.badge}</span>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">Accuracy: {user.score}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                          style={{ width: `${user.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}