import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Trophy,
  Target,
  Zap,
  BarChart3,
  Gamepad2,
  Award,
  DollarSign,
  Calendar,
  RefreshCw,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Fantasy = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedSport, setSelectedSport] = useState('cricket');
  const [selectedWeek, setSelectedWeek] = useState('current');
  const { user } = useAuth();

  // Fetch fantasy data
  const { data: fantasyData, isLoading, error } = useQuery(
    ['fantasy', selectedSport, selectedWeek],
    async () => {
      const response = await api.get('/fantasy', {
        params: {
          sport: selectedSport,
          week: selectedWeek
        }
      });
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const sports = [
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
  ];

  const tabs = [
    { id: 'predictions', label: 'AI Predictions', icon: Zap },
    { id: 'captains', label: 'Captain Picks', icon: Crown },
    { id: 'differentials', label: 'Differentials', icon: Target },
    { id: 'transfers', label: 'Transfer Tips', icon: RefreshCw },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 }
  ];

  const formatPrice = (price) => {
    return `$${price?.toFixed(1)}m` || 'N/A';
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (change < 0) return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-400';
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
          message="Failed to load fantasy data" 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Fantasy Sports - AI Predictions & Tips</title>
        <meta name="description" content="AI-powered fantasy sports predictions, captain picks, and transfer tips" />
      </Helmet>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold mb-4">Fantasy Sports Hub</h1>
            <p className="text-xl opacity-90 mb-8">
              AI-powered predictions and insights for your fantasy teams
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{fantasyData?.stats?.totalPredictions || 0}</div>
                <div className="text-sm opacity-75">AI Predictions</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{fantasyData?.stats?.accuracy || 0}%</div>
                <div className="text-sm opacity-75">Accuracy Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{fantasyData?.stats?.activeUsers || 0}</div>
                <div className="text-sm opacity-75">Active Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{fantasyData?.stats?.weeklyTips || 0}</div>
                <div className="text-sm opacity-75">Weekly Tips</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Sport Selection */}
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => (
                <button
                  key={sport.id}
                  onClick={() => setSelectedSport(sport.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSport === sport.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{sport.icon}</span>
                  <span>{sport.name}</span>
                </button>
              ))}
            </div>

            {/* Week Selection */}
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="current">Current Week</option>
              <option value="next">Next Week</option>
              <option value="upcoming">Upcoming Fixtures</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'predictions' && (
              <PredictionsTab data={fantasyData?.predictions} />
            )}
            {activeTab === 'captains' && (
              <CaptainsTab data={fantasyData?.captains} />
            )}
            {activeTab === 'differentials' && (
              <DifferentialsTab data={fantasyData?.differentials} />
            )}
            {activeTab === 'transfers' && (
              <TransfersTab data={fantasyData?.transfers} />
            )}
            {activeTab === 'analysis' && (
              <AnalysisTab data={fantasyData?.analysis} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Confidence */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                AI Confidence
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Captain Picks</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Differentials</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Transfers</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {fantasyData?.topPerformers?.slice(0, 5).map((player, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {player.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {player.team} • {player.position}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {player.points}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-purple-600" />
                Pro Tips
              </h3>
              <div className="space-y-3">
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    💡 Target players with favorable fixtures in the next 3 gameweeks
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    🎯 Consider form over fixtures for captaincy picks
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    📈 Monitor price changes to maximize team value
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const PredictionsTab = ({ data }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      AI Player Predictions
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data?.players?.map((player, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {player.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {player.team} • {player.position}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary-600">
                {player.predictedPoints}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Predicted Points
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price:</span>
              <span className="font-medium">{formatPrice(player.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ownership:</span>
              <span className="font-medium">{player.ownership}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Confidence:</span>
              <span className="font-medium text-green-600">{player.confidence}%</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const CaptainsTab = ({ data }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      Captain Recommendations
    </h2>
    <div className="space-y-4">
      {data?.map((captain, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {captain.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {captain.team} • {captain.fixture}
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded">
                  {captain.confidence}% confidence
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Expected: {captain.expectedPoints} pts
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                #{index + 1}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const DifferentialsTab = ({ data }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      Differential Picks
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data?.map((player, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {player.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {player.team}
              </p>
            </div>
            <Target className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Ownership:</span>
              <span className="font-medium text-blue-600">{player.ownership}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Expected Points:</span>
              <span className="font-medium">{player.expectedPoints}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Risk Level:</span>
              <span className={`font-medium ${
                player.riskLevel === 'Low' ? 'text-green-600' :
                player.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {player.riskLevel}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

const TransfersTab = ({ data }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      Transfer Recommendations
    </h2>
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Players to Transfer In
        </h3>
        <div className="space-y-3">
          {data?.transferIn?.map((player, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {player.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {player.team} • {formatPrice(player.price)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getChangeIcon(player.priceChange)}
                  <span className={`text-sm ${getChangeColor(player.priceChange)}`}>
                    {player.priceChange > 0 ? '+' : ''}{player.priceChange}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Players to Transfer Out
        </h3>
        <div className="space-y-3">
          {data?.transferOut?.map((player, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {player.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {player.team} • {formatPrice(player.price)}
                  </p>
                </div>
                <div className="text-sm text-red-600">
                  {player.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AnalysisTab = ({ data }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      AI Analysis & Insights
    </h2>
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Weekly Summary
      </h3>
      <div className="prose dark:prose-invert max-w-none">
        <p>{data?.weeklyAnalysis || 'AI analysis will be available soon...'}</p>
      </div>
    </div>
    
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Key Insights
      </h3>
      <div className="space-y-3">
        {data?.insights?.map((insight, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-blue-600">{index + 1}</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Fantasy;
