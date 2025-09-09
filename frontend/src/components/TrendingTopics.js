import React from 'react';
import {
  FireIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  HashtagIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function TrendingTopics() {
  const trendingTopics = [
    {
      topic: 'Climate Change',
      count: 23,
      trend: '+15%',
      color: 'green',
      category: 'Environment'
    },
    {
      topic: 'AI Technology',
      count: 18,
      trend: '+12%',
      color: 'blue',
      category: 'Technology'
    },
    {
      topic: 'COVID-19',
      count: 15,
      trend: '+8%',
      color: 'red',
      category: 'Health'
    },
    {
      topic: 'Election 2024',
      count: 12,
      trend: '+25%',
      color: 'purple',
      category: 'Politics'
    },
    {
      topic: 'Space Exploration',
      count: 9,
      trend: '+7%',
      color: 'orange',
      category: 'Science'
    },
    {
      topic: 'Cryptocurrency',
      count: 8,
      trend: '+5%',
      color: 'yellow',
      category: 'Finance'
    }
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Environment':
        return GlobeAltIcon;
      case 'Technology':
      case 'Science':
        return HashtagIcon;
      default:
        return FireIcon;
    }
  };

  return (
    <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center space-x-2">
          <FireIcon className="w-5 h-5 text-orange-500" />
          <span>Trending Topics</span>
        </h3>
        <div className="text-xs text-gray-500">Last 24h</div>
      </div>

      <div className="space-y-3">
        {trendingTopics.map((topic, index) => {
          const CategoryIcon = getCategoryIcon(topic.category);
          
          return (
            <div
              key={index}
              className="group cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-all duration-200 border border-transparent hover:border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-500 w-4 text-right">
                      #{index + 1}
                    </span>
                    <div className={`p-1.5 rounded-lg bg-${topic.color}-500/10 group-hover:bg-${topic.color}-500/20 transition-colors`}>
                      <CategoryIcon className={`w-3 h-3 text-${topic.color}-600 dark:text-${topic.color}-400`} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {topic.topic}
                    </p>
                    <p className="text-xs text-gray-500">
                      {topic.category} • {topic.count} claims
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
                    <TrendingUpIcon className="w-3 h-3" />
                    <span className="font-medium">{topic.trend}</span>
                  </div>
                </div>
              </div>

              {/* Trending indicator */}
              <div className="mt-2">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${topic.color}-400 to-${topic.color}-600 rounded-full transition-all duration-1000 group-hover:animate-pulse`}
                    style={{ 
                      width: `${(topic.count / Math.max(...trendingTopics.map(t => t.count))) * 100}%`,
                      animationDelay: `${index * 100}ms`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View more button */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <button className="w-full text-center text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200">
          View all trending topics →
        </button>
      </div>
    </div>
  );
}