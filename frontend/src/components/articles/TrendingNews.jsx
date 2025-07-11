import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  Clock, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';

const TrendingNews = ({ articles = [] }) => {
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

  if (articles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Trending Articles
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for trending news
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article, index) => (
        <motion.article
          key={article._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex">
            {/* Article Image */}
            <div className="flex-shrink-0">
              <Link to={`/articles/${article.slug}`} className="block">
                <img
                  src={article.featuredImage?.url || '/api/placeholder/200/150'}
                  alt={article.title}
                  className="w-32 h-24 sm:w-40 sm:h-32 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>

            {/* Article Content */}
            <div className="flex-1 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSportColor(article.sport)}`}>
                  {article.sport.charAt(0).toUpperCase() + article.sport.slice(1)}
                </span>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <TrendingUp className="w-3 h-3" />
                  <span>Trending #{index + 1}</span>
                </div>
              </div>

              <Link to={`/articles/${article.slug}`} className="block group">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {article.summary}
                </p>
              </Link>

              {/* Article Meta */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views?.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{article.likes?.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{article.shares?.toLocaleString()}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  {article.author?.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">
                        {article.author?.username?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {article.author?.username || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{article.readTime} min read</span>
                  <MessageCircle className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      ))}

      {/* View More Button */}
      <div className="text-center">
        <Link
          to="/articles?filter=trending"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span>View All Trending Articles</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default TrendingNews;
