import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  TrendingUp, 
  Trophy, 
  Calendar, 
  Users, 
  Gamepad2,
  ChevronRight,
  Play,
  Clock,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Components
import HeroSection from '../components/home/HeroSection';
import LiveScoreWidget from '../components/live-scores/LiveScoreWidget';
import TrendingNews from '../components/articles/TrendingNews';
import FeaturedArticles from '../components/articles/FeaturedArticles';
import FanReactionsWidget from '../components/reactions/FanReactionsWidget';
import FantasyWidget from '../components/fantasy/FantasyWidget';
import CalendarWidget from '../components/calendar/CalendarWidget';
import PersonalizedFeed from '../components/articles/PersonalizedFeed';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Home = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { user, isAuthenticated } = useAuth();

  // Fetch homepage data
  const { data: homeData, isLoading, error } = useQuery(
    'homepage',
    async () => {
      const [
        articlesRes,
        liveScoresRes,
        fantasyRes,
        calendarRes
      ] = await Promise.all([
        api.get('/articles?limit=6&filter=featured'),
        api.get('/live-scores?limit=5'),
        api.get('/fantasy/current'),
        api.get('/calendar/summary')
      ]);

      return {
        featuredArticles: articlesRes.data.articles,
        liveScores: liveScoresRes.data.matches,
        fantasy: fantasyRes.data.predictions,
        calendar: calendarRes.data.summary
      };
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Fetch trending articles
  const { data: trendingData } = useQuery(
    'trending-articles',
    () => api.get('/articles/feed/trending'),
    {
      select: (data) => data.data.articles
    }
  );

  const stats = [
    { 
      icon: Trophy, 
      label: 'Live Matches', 
      value: homeData?.calendar?.live || 0,
      color: 'text-green-600'
    },
    { 
      icon: Calendar, 
      label: 'Today\'s Games', 
      value: homeData?.calendar?.today || 0,
      color: 'text-blue-600'
    },
    { 
      icon: TrendingUp, 
      label: 'Trending Articles', 
      value: trendingData?.length || 0,
      color: 'text-purple-600'
    },
    { 
      icon: Users, 
      label: 'Active Fans', 
      value: '25.4K',
      color: 'text-orange-600'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="Failed to load homepage data" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Sports News - Live Scores, News & Fantasy Predictions</title>
        <meta name="description" content="Stay updated with the latest sports news, live scores, fantasy predictions, and fan reactions. Your ultimate sports destination." />
      </Helmet>

      {/* Hero Section */}
      <HeroSection featuredArticles={homeData?.featuredArticles || []} />

      {/* Stats Section */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2">
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personalized Feed for Authenticated Users */}
            {isAuthenticated && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Personalized Feed
                  </h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Customize →
                  </button>
                </div>
                <PersonalizedFeed />
              </section>
            )}

            {/* Trending News */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-purple-600" />
                  Trending Now
                </h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All →
                </button>
              </div>
              <TrendingNews articles={trendingData || []} />
            </section>

            {/* Featured Articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Featured Articles
                </h2>
                <div className="flex space-x-2">
                  {['all', 'cricket', 'football', 'basketball', 'tennis'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <FeaturedArticles 
                articles={homeData?.featuredArticles || []} 
                sport={activeTab === 'all' ? null : activeTab}
              />
            </section>

            {/* Fan Reactions */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Heart className="w-6 h-6 mr-2 text-red-500" />
                  Fan Reactions
                </h2>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  See All →
                </button>
              </div>
              <FanReactionsWidget />
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Live Scores Widget */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-green-600" />
                  Live Scores
                </h3>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All →
                </button>
              </div>
              <LiveScoreWidget matches={homeData?.liveScores || []} />
            </section>

            {/* Fantasy Widget */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2 text-blue-600" />
                  Fantasy Picks
                </h3>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View All →
                </button>
              </div>
              <FantasyWidget predictions={homeData?.fantasy} />
            </section>

            {/* Calendar Widget */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                  Upcoming Games
                </h3>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View Calendar →
                </button>
              </div>
              <CalendarWidget />
            </section>

            {/* Quick Links */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Live Scores', href: '/live-scores', icon: Trophy },
                  { name: 'Fantasy Sports', href: '/fantasy', icon: Gamepad2 },
                  { name: 'Match Calendar', href: '/calendar', icon: Calendar },
                  { name: 'Fan Chat', href: '/chat', icon: Users }
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{link.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </a>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
