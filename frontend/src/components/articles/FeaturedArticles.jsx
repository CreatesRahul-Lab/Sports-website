import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Heart, Share2, Clock, User } from 'lucide-react';

const FeaturedArticles = ({ articles = [], sport = null }) => {
  const filteredArticles = sport 
    ? articles.filter(article => article.sport === sport)
    : articles;

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getSportColor = (sport) => {
    const colors = {
      cricket: 'bg-green-100 text-green-800',
      football: 'bg-blue-100 text-blue-800',
      basketball: 'bg-orange-100 text-orange-800',
      tennis: 'bg-purple-100 text-purple-800',
      baseball: 'bg-red-100 text-red-800',
      hockey: 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[sport] || colors.general;
  };

  if (filteredArticles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">📰</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Featured Articles
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for featured content
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredArticles.map((article, index) => (
        <motion.article
          key={article._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
        >
          <Link to={`/articles/${article.slug}`} className="block">
            <div className="relative">
              <img
                src={article.featuredImage?.url || '/api/placeholder/400/200'}
                alt={article.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSportColor(article.sport)}`}>
                  {article.sport.charAt(0).toUpperCase() + article.sport.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views?.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{article.likes?.toLocaleString()}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  {article.author?.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {article.author?.username || 'Unknown'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {article.readTime} min read
                </span>
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
};

export default FeaturedArticles;
