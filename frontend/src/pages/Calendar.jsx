import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  Clock,
  MapPin,
  Users,
  Trophy,
  Play,
  Eye,
  Star,
  Download,
  Share2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MatchChat from '../components/chat/MatchChat';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const { user } = useAuth();

  // Fetch calendar data
  const { data: calendarData, isLoading, error } = useQuery(
    ['calendar', currentDate.getMonth(), currentDate.getFullYear(), selectedSport],
    async () => {
      const response = await api.get('/calendar', {
        params: {
          month: currentDate.getMonth() + 1,
          year: currentDate.getFullYear(),
          sport: selectedSport === 'all' ? undefined : selectedSport
        }
      });
      return response.data;
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const sports = [
    { id: 'all', name: 'All Sports', icon: '🏆' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
  ];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) { // 6 weeks x 7 days
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  const getMatchesForDate = (date) => {
    if (!calendarData?.matches) return [];
    
    return calendarData.matches.filter(match => {
      const matchDate = new Date(match.date);
      return matchDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
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
          message="Failed to load calendar data" 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Match Calendar - Sports News</title>
        <meta name="description" content="Sports match calendar with upcoming games and fixtures" />
      </Helmet>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <CalendarIcon className="w-8 h-8 mr-3 text-blue-600" />
                Match Calendar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Upcoming sports fixtures and match schedules
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={navigateToToday}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="xl:col-span-3">
            {/* Calendar Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Month Navigation */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatDate(currentDate)}
                  </h2>
                  
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Sport Filter */}
                <div className="flex flex-wrap gap-2">
                  {sports.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => setSelectedSport(sport.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const dayMatches = getMatchesForDate(day);
                  const isTodayDate = isToday(day);
                  const isCurrentMonthDate = isCurrentMonth(day);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
                        !isCurrentMonthDate 
                          ? 'bg-gray-50 dark:bg-gray-900' 
                          : 'bg-white dark:bg-gray-800'
                      } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isTodayDate 
                          ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                          : isCurrentMonthDate
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayMatches.slice(0, 3).map((match, matchIndex) => (
                          <button
                            key={matchIndex}
                            onClick={() => setSelectedMatch(match)}
                            className="w-full text-left p-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            <div className="font-medium truncate">
                              {match.homeTeam} vs {match.awayTeam}
                            </div>
                            <div className="text-xs opacity-75">
                              {formatTime(match.date)}
                            </div>
                          </button>
                        ))}
                        
                        {dayMatches.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            +{dayMatches.length - 3} more
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Matches List */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Upcoming Matches This Month
              </h3>
              <div className="space-y-4">
                {calendarData?.matches?.slice(0, 10).map((match, index) => (
                  <motion.div
                    key={match._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedMatch(match)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{sports.find(s => s.id === match.sport)?.icon || '🏆'}</div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {match.homeTeam} vs {match.awayTeam}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>{match.competition}</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(match.date)}</span>
                            </div>
                            {match.venue && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{match.venue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {new Date(match.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {match.sport}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Details */}
            {selectedMatch ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Match Details
                </h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedMatch.competition}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedMatch.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTime(selectedMatch.date)}
                      </span>
                    </div>
                    {selectedMatch.venue && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Venue:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedMatch.venue}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sport:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {selectedMatch.sport}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                      Set Reminder
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Match Details
                </h3>
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a match to view details
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                This Month
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Matches</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {calendarData?.stats?.totalMatches || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Live Matches</span>
                  <span className="text-lg font-bold text-red-600">
                    {calendarData?.stats?.liveMatches || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
                  <span className="text-lg font-bold text-blue-600">
                    {calendarData?.stats?.upcomingMatches || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="text-lg font-bold text-green-600">
                    {calendarData?.stats?.completedMatches || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Match Chat */}
            {selectedMatch && (
              <MatchChat 
                matchId={selectedMatch._id}
                isLive={selectedMatch.status === 'live'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
