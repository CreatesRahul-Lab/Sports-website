import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Filter, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Users, 
  Trophy,
  Target,
  BarChart3,
  Play,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Grid,
  List,
  ArrowUpDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LiveScoreWidget from '../components/live-scores/LiveScoreWidget';
import CalendarWidget from '../components/calendar/CalendarWidget';
import FanReactionsWidget from '../components/reactions/FanReactionsWidget';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const SportPage = () => {
  const { sport } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('publishedAt');

  // Fetch sport data
  const { data: sportData, isLoading, error } = useQuery(
    ['sport', sport, activeFilter, sortBy],
    async () => {
      const [
        articlesRes,
        liveScoresRes,
        matchesRes,
        statsRes
      ] = await Promise.all([
        api.get(`/articles/sport/${sport}?filter=${activeFilter}&sort=${sortBy}&limit=12`),
        api.get(`/live-scores?sport=${sport}&limit=10`),
        api.get(`/calendar?sport=${sport}&limit=10`),
        api.get(`/stats/sport/${sport}`)
      ]);

      return {
        articles: articlesRes.data.articles || [],
        liveScores: liveScoresRes.data.matches || [],
        matches: matchesRes.data.matches || [],
        stats: statsRes.data || {}
      };
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const sportConfig = {
    cricket: {
      name: 'Cricket',
      icon: '🏏',
      color: 'bg-green-600',
      description: 'The gentleman\'s game with passion and precision'
    },
    football: {
      name: 'Football',
      icon: '⚽',
      color: 'bg-blue-600',
      description: 'The beautiful game that unites the world'
    },
    basketball: {
      name: 'Basketball',
      icon: '🏀',
      color: 'bg-orange-600',
      description: 'Fast-paced action on the hardwood'
    },
    tennis: {
      name: 'Tennis',
      icon: '🎾',
      color: 'bg-purple-600',
      description: 'Precision, power, and elegance'
    }
  };

  const currentSport = sportConfig[sport] || {
    name: sport?.charAt(0).toUpperCase() + sport?.slice(1),
    icon: '🏆',
    color: 'bg-gray-600',
    description: 'Sports news and updates'
  };

  const filterOptions = [
    { key: 'latest', label: 'Latest', icon: Clock },
    { key: 'popular', label: 'Popular', icon: TrendingUp },
    { key: 'controversial', label: 'Controversial', icon: MessageCircle },
    { key: 'trending', label: 'Trending', icon: BarChart3 }
  ];

  const sortOptions = [
    { key: 'publishedAt', label: 'Date' },
    { key: 'views', label: 'Views' },
    { key: 'likes', label: 'Likes' },
    { key: 'comments', label: 'Comments' }
  ];

  const handleArticleClick = (article) => {
    navigate(`/articles/${article._id}`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorMessage 
          message="Failed to load sport data" 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{currentSport.name} - Sports News</title>
        <meta name="description" content={`Latest ${currentSport.name} news, scores, and updates`} />
      </Helmet>

      {/* Hero Section */}
      <div className={`relative ${currentSport.color} text-white`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">{currentSport.icon}</div>
            <h1 className="text-4xl font-bold mb-4">{currentSport.name}</h1>
            <p className="text-xl opacity-90 mb-8">{currentSport.description}</p>
            
            {/* Sport Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{sportData?.stats?.totalArticles || 0}</div>
                <div className="text-sm opacity-75">Articles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{sportData?.stats?.liveMatches || 0}</div>
                <div className="text-sm opacity-75">Live Matches</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{sportData?.stats?.upcomingMatches || 0}</div>
                <div className="text-sm opacity-75">Upcoming</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{sportData?.stats?.totalViews || 0}</div>
                <div className="text-sm opacity-75">Total Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Filter and Sort Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => {
                    const Icon = filter.icon;
                    return (
                      <button
                        key={filter.key}
                        onClick={() => setActiveFilter(filter.key)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeFilter === filter.key
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View and Sort Controls */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          Sort by {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'grid' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${
                        viewMode === 'list' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-6' 
                : 'space-y-6'
            }`}>
              {sportData?.articles?.map((article, index) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                    viewMode === 'list' ? 'flex space-x-4' : ''
                  }`}
                  onClick={() => handleArticleClick(article)}
                >
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className={`${
                        viewMode === 'list' 
                          ? 'w-32 h-32 object-cover' 
                          : 'w-full h-48 object-cover'
                      }`}
                    />
                  )}
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''} p-6`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-primary-600 font-medium">
                        {article.sport}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${
                      viewMode === 'list' ? 'text-lg line-clamp-2' : 'text-xl line-clamp-2'
                    }`}>
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{article.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{article.likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{getReadingTime(article.content)} min</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        by {article.author}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {sportData?.articles?.length === 12 && (
              <div className="text-center mt-8">
                <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  Load More Articles
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Live Scores */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-green-600" />
                Live Scores
              </h3>
              <LiveScoreWidget 
                matches={sportData?.liveScores || []} 
                sport={sport}
              />
            </div>

            {/* Upcoming Matches */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Matches
              </h3>
              <CalendarWidget 
                matches={sportData?.matches || []} 
                sport={sport}
              />
            </div>

            {/* Fan Reactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Fan Reactions
              </h3>
              <FanReactionsWidget sport={sport} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SportPage;
