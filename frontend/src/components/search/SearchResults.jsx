import React from 'react';
import { Search, Calendar, User, Hash, Filter, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchResults = ({ 
  results = [], 
  isLoading = false, 
  query = '', 
  filters = {}, 
  onClearFilters,
  onFilterChange,
  onResultClick 
}) => {
  const { type, sport, date, author } = filters;
  
  const resultTypes = [
    { key: 'all', label: 'All', icon: Search },
    { key: 'articles', label: 'Articles', icon: Hash },
    { key: 'matches', label: 'Matches', icon: Calendar },
    { key: 'users', label: 'Users', icon: User },
  ];

  const sportOptions = [
    { key: 'all', label: 'All Sports' },
    { key: 'cricket', label: 'Cricket' },
    { key: 'football', label: 'Football' },
    { key: 'basketball', label: 'Basketball' },
    { key: 'tennis', label: 'Tennis' },
  ];

  const hasActiveFilters = Object.values(filters).some(value => 
    value && value !== 'all' && value !== ''
  );

  const getResultIcon = (result) => {
    switch (result.type) {
      case 'article':
        return <Hash className="w-4 h-4 text-blue-500" />;
      case 'match':
        return <Calendar className="w-4 h-4 text-green-500" />;
      case 'user':
        return <User className="w-4 h-4 text-purple-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Search Results
          </h2>
          {query && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Results for "{query}" ({results.length} found)
            </p>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={type || 'all'}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {resultTypes.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sport Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sport
            </label>
            <select
              value={sport || 'all'}
              onChange={(e) => onFilterChange('sport', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {sportOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date || ''}
              onChange={(e) => onFilterChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Author
            </label>
            <input
              type="text"
              value={author || ''}
              onChange={(e) => onFilterChange('author', e.target.value)}
              placeholder="Author name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {results.map((result, index) => (
              <motion.div
                key={result.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onResultClick(result)}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getResultIcon(result)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </h3>
                      {result.trending && (
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <span className="capitalize">{result.type}</span>
                      {result.sport && (
                        <span className="capitalize">{result.sport}</span>
                      )}
                      {result.date && (
                        <span>{formatDate(result.date)}</span>
                      )}
                      {result.author && (
                        <span>by {result.author}</span>
                      )}
                    </div>
                    
                    {result.description && (
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {result.description}
                      </p>
                    )}
                    
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {result.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {result.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                            +{result.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {result.image && (
                    <div className="flex-shrink-0">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
