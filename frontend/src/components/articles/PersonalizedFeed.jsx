import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const PersonalizedFeed = () => {
  const { user } = useAuth();

  const { data: articles, isLoading, error } = useQuery(
    ['personalized-feed', user?.id],
    () => api.get('/articles/feed/personalized'),
    {
      enabled: !!user,
      select: (data) => data.data.articles
    }
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <ErrorMessage message="Failed to load personalized feed" />
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Personalize Your Feed
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Follow your favorite teams and sports to get personalized content
          </p>
          <Link
            to="/preferences"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Set Preferences
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.slice(0, 3).map((article) => (
        <div key={article._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex space-x-4">
            <img
              src={article.featuredImage?.url || '/api/placeholder/120/80'}
              alt={article.title}
              className="w-20 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <Link to={`/articles/${article.slug}`} className="block">
                <h3 className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {article.summary}
                </p>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PersonalizedFeed;
