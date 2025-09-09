import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  TrendingUpIcon, 
  UsersIcon,
  DocumentTextIcon,
  SparklesIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import ClaimCard from './ClaimCard';
import LoadingSpinner, { InlineLoader } from './LoadingSpinner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

export default function Dashboard({ isAuthenticated, currentUser, onLogin }) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClaims: 0,
    totalUsers: 0,
    verificationsMade: 0,
    aiAnalyses: 0
  });
  const [filter, setFilter] = useState('all'); // all, true, false, unclear
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, controversial

  useEffect(() => {
    fetchClaims();
    fetchStats();
  }, [filter, sortBy]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/claims`);
      if (response.ok) {
        const data = await response.json();
        setClaims(data);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // In a real app, you'd have dedicated stats endpoints
      const claimsResponse = await fetch(`${BACKEND_URL}/api/claims`);
      if (claimsResponse.ok) {
        const claimsData = await claimsResponse.json();
        setStats({
          totalClaims: claimsData.length,
          totalUsers: 147, // Mock data - would come from actual endpoint
          verificationsMade: claimsData.reduce((sum, claim) => 
            sum + (claim.support_count || 0) + (claim.refute_count || 0) + (claim.unclear_count || 0), 0
          ),
          aiAnalyses: claimsData.filter(claim => claim.ai_summary).length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (filter === 'all') return true;
    if (filter === 'true') return claim.ai_label?.toLowerCase().includes('true');
    if (filter === 'false') return claim.ai_label?.toLowerCase().includes('false');
    if (filter === 'unclear') return !claim.ai_label?.toLowerCase().includes('true') && !claim.ai_label?.toLowerCase().includes('false');
    return true;
  });

  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'popular') {
      const aTotal = (a.support_count || 0) + (a.refute_count || 0) + (a.unclear_count || 0);
      const bTotal = (b.support_count || 0) + (b.refute_count || 0) + (b.unclear_count || 0);
      return bTotal - aTotal;
    }
    if (sortBy === 'controversial') {
      const aControversy = Math.abs((a.support_count || 0) - (a.refute_count || 0));
      const bControversy = Math.abs((b.support_count || 0) - (b.refute_count || 0));
      return aControversy - bControversy; // Lower difference = more controversial
    }
    return 0;
  });

  const handleLike = (claimId) => {
    // Implement like functionality
    console.log('Liked claim:', claimId);
  };

  const handleShare = (claim) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this claim on PeerFact',
        text: claim.text.substring(0, 100) + '...',
        url: window.location.origin + `/claim/${claim.id}`
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + `/claim/${claim.id}`);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-gradient mb-6">
              Welcome to PeerFact
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              The community-driven platform for fact-checking claims with AI assistance and crowd verification.
              Help build a more informed world, one fact at a time.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onLogin}
                  className="glass-button gradient-primary text-white px-8 py-4 text-lg font-medium hover:shadow-xl hover:shadow-blue-500/25"
                >
                  <UsersIcon className="h-5 w-5 mr-2" />
                  Join the Community
                </button>
                <Link
                  to="/create"
                  className="glass-button border border-white/20 px-8 py-4 text-lg font-medium text-gray-700 dark:text-gray-300"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Submit a Claim
                </Link>
              </div>
            ) : (
              <Link
                to="/create"
                className="glass-button gradient-primary text-white px-8 py-4 text-lg font-medium hover:shadow-xl hover:shadow-blue-500/25 inline-flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Claim
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalClaims.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Claims Submitted</p>
          </div>

          <div className="glass-card text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckBadgeIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.verificationsMade.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Verifications Made</p>
          </div>

          <div className="glass-card text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalUsers.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Active Users</p>
          </div>

          <div className="glass-card text-center hover-lift">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.aiAnalyses.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">AI Analyses</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="glass-card mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FireIcon className="h-6 w-6 mr-2 text-orange-500" />
                    Recent Claims
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Latest fact-checking submissions from the community
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Filter */}
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="glass-input text-sm"
                  >
                    <option value="all">All Claims</option>
                    <option value="true">Mostly True</option>
                    <option value="false">Mostly False</option>
                    <option value="unclear">Unclear</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-input text-sm"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="controversial">Most Controversial</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Claims Feed */}
            {loading ? (
              <InlineLoader message="Loading claims..." size="lg" />
            ) : sortedClaims.length === 0 ? (
              <div className="glass-card text-center py-12">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No claims found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Be the first to submit a claim for fact-checking!
                </p>
                <Link
                  to="/create"
                  className="glass-button gradient-primary text-white inline-flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create First Claim
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedClaims.map((claim) => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    isAuthenticated={isAuthenticated}
                    onLogin={onLogin}
                    onLike={handleLike}
                    onShare={handleShare}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/create"
                  className="glass-button w-full flex items-center justify-center gradient-primary text-white"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Submit Claim
                </Link>
                <Link
                  to="/leaderboard"
                  className="glass-button w-full flex items-center justify-center"
                >
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  View Leaderboard
                </Link>
                <Link
                  to="/analytics"
                  className="glass-button w-full flex items-center justify-center"
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Analytics
                </Link>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FireIcon className="h-5 w-5 mr-2 text-orange-500" />
                Trending Topics
              </h3>
              <div className="space-y-2">
                {['Climate Change', 'Technology', 'Health', 'Politics', 'Science'].map((topic, index) => (
                  <div
                    key={topic}
                    className="flex items-center justify-between p-2 glass rounded-lg hover:bg-white/10 cursor-pointer"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">#{topic}</span>
                    <span className="text-xs text-gray-500">{Math.floor(Math.random() * 50) + 10}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      New claim verified as <span className="text-green-500 font-medium">Mostly True</span>
                    </p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      AI analysis completed for new submission
                    </p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Community member reached Level 5
                    </p>
                    <p className="text-xs text-gray-500">10 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🤔 How It Works
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>Submit claims that need fact-checking</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>AI provides initial analysis and insights</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>Community verifies with sources and evidence</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 font-bold">4.</span>
                  <span>Build reputation through accurate fact-checking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}