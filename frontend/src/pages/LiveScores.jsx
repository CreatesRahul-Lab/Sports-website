import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Play, 
  Pause,
  RefreshCw,
  Filter,
  Search,
  MapPin,
  Users,
  Zap,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import MatchChat from '../components/chat/MatchChat';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const LiveScores = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { socket } = useSocket();

  // Fetch live scores
  const { data: matchesData, isLoading, error, refetch } = useQuery(
    ['live-scores', selectedSport, searchQuery],
    async () => {
      const response = await api.get(`/live-scores`, {
        params: {
          sport: selectedSport === 'all' ? undefined : selectedSport,
          search: searchQuery || undefined,
          limit: 50
        }
      });
      return response.data;
    },
    {
      refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
      staleTime: 10000, // 10 seconds
    }
  );

  // Socket connection for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('score-update', (data) => {
        // Update the scores in real-time
        refetch();
      });

      socket.on('match-status-change', (data) => {
        refetch();
      });

      return () => {
        socket.off('score-update');
        socket.off('match-status-change');
      };
    }
  }, [socket, refetch]);

  const sports = [
    { id: 'all', name: 'All Sports', icon: '🏆' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
  ];

  const getMatchStatus = (match) => {
    if (match.status === 'live') return 'Live';
    if (match.status === 'upcoming') return 'Upcoming';
    if (match.status === 'finished') return 'Finished';
    return match.status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'finished': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredMatches = matchesData?.matches?.filter(match => {
    const matchesSearch = !searchQuery || 
      match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.competition?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSport = selectedSport === 'all' || match.sport === selectedSport;
    
    return matchesSearch && matchesSport;
  }) || [];

  const liveMatches = filteredMatches.filter(match => match.status === 'live');
  const upcomingMatches = filteredMatches.filter(match => match.status === 'upcoming');
  const finishedMatches = filteredMatches.filter(match => match.status === 'finished');

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
          message="Failed to load live scores" 
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Live Scores - Sports News</title>
        <meta name="description" content="Live sports scores and real-time updates" />
      </Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-green-600" />
                Live Scores
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time sports scores and updates
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span>{autoRefresh ? 'Auto Refresh' : 'Manual Refresh'}</span>
              </button>
              
              <button
                onClick={() => refetch()}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Sport Filter */}
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search teams or competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Zap className="w-6 h-6 mr-2 text-red-500" />
                  Live Matches
                  <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full text-sm">
                    {liveMatches.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {liveMatches.map((match, index) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      index={index}
                      onSelect={() => setSelectedMatch(match)}
                      isSelected={selectedMatch?._id === match._id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-500" />
                  Upcoming Matches
                  <span className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full text-sm">
                    {upcomingMatches.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {upcomingMatches.slice(0, 10).map((match, index) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      index={index}
                      onSelect={() => setSelectedMatch(match)}
                      isSelected={selectedMatch?._id === match._id}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Finished Matches */}
            {finishedMatches.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-green-500" />
                  Recent Results
                  <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full text-sm">
                    {finishedMatches.length}
                  </span>
                </h2>
                <div className="space-y-4">
                  {finishedMatches.slice(0, 10).map((match, index) => (
                    <MatchCard
                      key={match._id}
                      match={match}
                      index={index}
                      onSelect={() => setSelectedMatch(match)}
                      isSelected={selectedMatch?._id === match._id}
                    />
                  ))}
                </div>
              </section>
            )}

            {filteredMatches.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No matches found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>

          {/* Match Chat Sidebar */}
          <div className="space-y-6">
            {selectedMatch ? (
              <MatchChat 
                matchId={selectedMatch._id}
                isLive={selectedMatch.status === 'live'}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Match Chat
                </h3>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a match to join the conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Match Card Component
const MatchCard = ({ match, index, onSelect, isSelected }) => {
  const status = getMatchStatus(match);
  const statusColor = getStatusColor(match.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getSportIcon(match.sport)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {match.competition}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {match.sport}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Home Team */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {match.homeTeam}
          </div>
          {match.homeTeamLogo && (
            <img 
              src={match.homeTeamLogo} 
              alt={match.homeTeam}
              className="w-12 h-12 mx-auto object-contain"
            />
          )}
        </div>

        {/* Score/Time */}
        <div className="text-center">
          {match.status === 'live' && match.score ? (
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {match.score.home} - {match.score.away}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {match.score.status}
              </div>
            </div>
          ) : match.status === 'finished' && match.score ? (
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {match.score.home} - {match.score.away}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Final
              </div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {formatTime(match.date)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(match.date)}
              </div>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {match.awayTeam}
          </div>
          {match.awayTeamLogo && (
            <img 
              src={match.awayTeamLogo} 
              alt={match.awayTeam}
              className="w-12 h-12 mx-auto object-contain"
            />
          )}
        </div>
      </div>

      {match.venue && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{match.venue}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Helper functions
const getSportIcon = (sport) => {
  const icons = {
    cricket: '🏏',
    football: '⚽',
    basketball: '🏀',
    tennis: '🎾',
  };
  return icons[sport] || '🏆';
};

const getMatchStatus = (match) => {
  if (match.status === 'live') return 'Live';
  if (match.status === 'upcoming') return 'Upcoming';
  if (match.status === 'finished') return 'Finished';
  return match.status;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'live': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'finished': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

export default LiveScores;
