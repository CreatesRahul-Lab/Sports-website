import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Home, 
  ArrowLeft, 
  Search,
  Trophy,
  Frown
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const suggestions = [
    { name: 'Latest News', href: '/', icon: Home },
    { name: 'Live Scores', href: '/live-scores', icon: Trophy },
    { name: 'Cricket', href: '/sport/cricket', icon: '🏏' },
    { name: 'Football', href: '/sport/football', icon: '⚽' },
    { name: 'Basketball', href: '/sport/basketball', icon: '🏀' },
    { name: 'Tennis', href: '/sport/tennis', icon: '🎾' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <Helmet>
        <title>Page Not Found - Sports News</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
      </Helmet>

      <div className="max-w-lg w-full text-center">
        {/* 404 Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="mb-8"
        >
          <div className="text-9xl font-bold text-primary-600 mb-4">
            <motion.span
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              4
            </motion.span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="inline-block"
            >
              0
            </motion.span>
            <motion.span
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
            >
              4
            </motion.span>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-6xl mb-4"
          >
            <Frown className="w-16 h-16 mx-auto text-gray-400" />
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Oops! Page not found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home Page</span>
          </Link>
        </motion.div>

        {/* Search Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Looking for something specific?
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles, teams, or players..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Try these popular sections:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
              >
                <Link
                  to={suggestion.href}
                  className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
                >
                  <div className="mb-2 text-2xl">
                    {typeof suggestion.icon === 'string' ? (
                      <span>{suggestion.icon}</span>
                    ) : (
                      <suggestion.icon className="w-6 h-6 text-primary-600 group-hover:text-primary-700" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {suggestion.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            If you think this is an error, please{' '}
            <Link 
              to="/contact" 
              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              contact support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
