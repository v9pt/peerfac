import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useApp } from '../App';
import ClaimCard from '../components/ClaimCard';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';

const HomePage = () => {
  const { user, claims, fetchClaims, API, theme } = useApp();
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('cards');

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'confidence', label: 'Highest Confidence' },
    { value: 'controversial', label: 'Most Controversial' },
    { value: 'verified', label: 'Most Verified' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Claims' },
    { value: 'true', label: 'Likely True' },
    { value: 'false', label: 'Likely False' },
    { value: 'unclear', label: 'Unclear' },
    { value: 'unverified', label: 'Unverified' },
  ];

  const handleVote = async (claimId, stance) => {
    if (!user) return;
    
    try {
      await axios.post(`${API}/claims/${claimId}/verify`, {
        author_id: user.id,
        stance: stance,
        source_url: null,
        explanation: null,
      });
      
      // Refresh claims to show updated counts
      fetchClaims();
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const filteredAndSortedClaims = React.useMemo(() => {
    let filtered = [...claims];

    // Apply filters
    if (filterBy !== 'all') {
      filtered = filtered.filter(claim => {
        if (filterBy === 'unverified') return !claim.ai_label;
        if (filterBy === 'true') return claim.ai_label?.toLowerCase().includes('true');
        if (filterBy === 'false') return claim.ai_label?.toLowerCase().includes('false');
        if (filterBy === 'unclear') return claim.ai_label?.toLowerCase().includes('unclear');
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return (b.confidence || 0) - (a.confidence || 0);
        case 'controversial':
          const aTotal = (a.support_count || 0) + (a.refute_count || 0) + (a.unclear_count || 0);
          const bTotal = (b.support_count || 0) + (b.refute_count || 0) + (b.unclear_count || 0);
          return bTotal - aTotal;
        case 'verified':
          const aVerified = (a.support_count || 0) + (a.refute_count || 0) + (a.unclear_count || 0);
          const bVerified = (b.support_count || 0) + (b.refute_count || 0) + (b.unclear_count || 0);
          return bVerified - aVerified;
        case 'recent':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [claims, sortBy, filterBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Latest Claims
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover and verify the latest claims from the community
          </p>
        </div>
        
        <Link
          to="/create"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Claim</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: claims.length, color: 'blue', change: '+12%' },
          { label: 'Verified Today', value: '127', color: 'green', change: '+8%' },
          { label: 'Community Score', value: '94%', color: 'purple', change: '+3%' },
          { label: 'Active Verifiers', value: '1,593', color: 'orange', change: '+15%' },
        ].map((stat, index) => (
          <div
            key={index}
            className={`p-6 rounded-xl border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`text-sm font-medium text-${stat.color}-600 bg-${stat.color}-100 px-2 py-1 rounded`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Controls */}
      <div className={`flex items-center justify-between p-4 rounded-lg border ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className={`border rounded-lg px-3 py-2 text-sm ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-sm ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-lg ${
              viewMode === 'cards'
                ? 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            } transition-colors`}
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            } transition-colors`}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Claims Grid/List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredAndSortedClaims.length === 0 ? (
        <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg font-medium">No claims found</p>
          <p className="mt-2">Be the first to share a claim that needs verification!</p>
          <Link
            to="/create"
            className="inline-flex items-center space-x-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create First Claim</span>
          </Link>
        </div>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'cards' 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1'
        }`}>
          {filteredAndSortedClaims.map((claim) => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              onVote={handleVote}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;