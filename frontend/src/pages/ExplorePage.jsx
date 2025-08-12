import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FireIcon, TrendingUpIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useApp } from '../App';
import ClaimCard from '../components/ClaimCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ExplorePage = () => {
  const { claims, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'trending', name: 'Trending', icon: FireIcon, color: 'red' },
    { id: 'recent', name: 'Recent', icon: ClockIcon, color: 'blue' },
    { id: 'controversial', name: 'Controversial', icon: TrendingUpIcon, color: 'orange' },
    { id: 'verified', name: 'Most Verified', icon: TrendingUpIcon, color: 'green' },
  ];

  const topics = [
    { name: 'Politics', count: 234, trending: true },
    { name: 'Science', count: 189, trending: true },
    { name: 'Health', count: 156, trending: false },
    { name: 'Technology', count: 145, trending: true },
    { name: 'Climate', count: 123, trending: false },
    { name: 'Economy', count: 98, trending: false },
    { name: 'Sports', count: 87, trending: false },
    { name: 'Entertainment', count: 76, trending: false },
  ];

  const filteredClaims = React.useMemo(() => {
    let filtered = [...claims];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.text.toLowerCase().includes(query) ||
        claim.ai_summary?.toLowerCase().includes(query) ||
        claim.ai_label?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (selectedCategory) {
      case 'trending':
        filtered.sort((a, b) => {
          const aScore = (a.support_count || 0) + (a.refute_count || 0) + (a.unclear_count || 0);
          const bScore = (b.support_count || 0) + (b.refute_count || 0) + (b.unclear_count || 0);
          return bScore - aScore;
        });
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'controversial':
        filtered.sort((a, b) => {
          const aControversy = Math.abs((a.support_count || 0) - (a.refute_count || 0));
          const bControversy = Math.abs((b.support_count || 0) - (b.refute_count || 0));
          return aControversy - bControversy; // Lower difference = more controversial
        });
        break;
      case 'verified':
        filtered.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        break;
      default:
        break;
    }

    return filtered.slice(0, 20); // Limit results
  }, [claims, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Explore Claims
        </h1>
        <p className={`mt-2 text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Discover trending topics and dive deep into fact-checking
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <MagnifyingGlassIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claims, topics, or keywords..."
            className={`w-full pl-12 pr-6 py-4 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg`}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Categories
            </h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? `bg-${category.color}-100 text-${category.color}-700 border border-${category.color}-200`
                      : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <category.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Popular Topics
            </h2>
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div
                  key={topic.name}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      #{topic.name}
                    </span>
                    {topic.trending && (
                      <FireIcon className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {topic.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className={`p-6 rounded-xl border ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Quick Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Claims Today
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  247
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Verifications
                </span>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  1,893
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Accuracy Rate
                </span>
                <span className="text-sm font-medium text-green-600">
                  94.2%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {categories.find(c => c.id === selectedCategory)?.name} Claims
              </h2>
              {searchQuery && (
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Results for "{searchQuery}" • {filteredClaims.length} found
                </p>
              )}
            </div>
          </div>

          {/* Claims Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No claims found</p>
              <p className="mt-2">
                {searchQuery 
                  ? `No claims match your search for "${searchQuery}"` 
                  : 'No claims available in this category'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;