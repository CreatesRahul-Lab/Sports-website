import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Circle, 
  Clock, 
  MapPin, 
  TrendingUp,
  Calendar,
  ExternalLink
} from 'lucide-react';

const LiveScoreWidget = ({ matches = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'text-green-500';
      case 'finished':
        return 'text-gray-500';
      case 'scheduled':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'live':
        return <Circle className="w-2 h-2 fill-current animate-pulse" />;
      case 'finished':
        return <Trophy className="w-3 h-3" />;
      case 'scheduled':
        return <Calendar className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (matches.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Live Matches
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later for live scores
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {matches.map((match, index) => (
          <motion.div
            key={match.matchId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`flex items-center space-x-1 text-xs font-medium ${getStatusColor(match.status)}`}>
                  {getStatusIcon(match.status)}
                  <span className="capitalize">{match.status}</span>
                </span>
                <span className="text-xs text-gray-500">
                  {match.sport.charAt(0).toUpperCase() + match.sport.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  {match.status === 'live' 
                    ? match.liveData?.currentTime || 'Live'
                    : formatTime(match.startTime)
                  }
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                {/* Home Team */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {match.homeTeam.logo && (
                      <img
                        src={match.homeTeam.logo}
                        alt={match.homeTeam.name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {match.homeTeam.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {match.homeTeam.score}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {match.awayTeam.logo && (
                      <img
                        src={match.awayTeam.logo}
                        alt={match.awayTeam.name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {match.awayTeam.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {match.awayTeam.score}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{match.venue?.name || 'TBD'}</span>
              </div>
              <Link
                to={`/match/${match.matchId}`}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
              >
                <span>Details</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Live Data for Cricket */}
            {match.sport === 'cricket' && match.cricketData && match.status === 'live' && (
              <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
                <div className="flex justify-between">
                  <span>Overs: {match.cricketData.overs?.homeTeam || 0}</span>
                  <span>Run Rate: {match.cricketData.runRate?.homeTeam || 0}</span>
                </div>
              </div>
            )}

            {/* Live Events */}
            {match.status === 'live' && match.liveData?.events?.length > 0 && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                <div className="flex items-center space-x-1 text-green-700 dark:text-green-300">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">Latest:</span>
                  <span>{match.liveData.events[0]?.description}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3">
        <Link
          to="/live-scores"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center space-x-1"
        >
          <span>View All Live Scores</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default LiveScoreWidget;
