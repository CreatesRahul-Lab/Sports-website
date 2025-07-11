import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CalendarWidget = ({ matches = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState('all');

  const today = new Date();
  const todayStr = today.toDateString();
  const currentWeek = getWeekDates(currentDate);

  const sports = [
    { id: 'all', name: 'All Sports', icon: '🏆' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
  ];

  const filteredMatches = matches.filter(match => {
    const matchDate = new Date(match.date);
    const isInWeek = currentWeek.some(date => 
      date.toDateString() === matchDate.toDateString()
    );
    const sportMatch = selectedSport === 'all' || match.sport === selectedSport;
    return isInWeek && sportMatch;
  });

  const getMatchesForDate = (date) => {
    return filteredMatches.filter(match => 
      new Date(match.date).toDateString() === date.toDateString()
    );
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getMatchStatus = (match) => {
    const now = new Date();
    const matchTime = new Date(match.date);
    
    if (matchTime > now) return 'upcoming';
    if (match.status === 'live') return 'live';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Match Calendar
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Sports Filter */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto">
        {sports.map((sport) => (
          <button
            key={sport.id}
            onClick={() => setSelectedSport(sport.id)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedSport === sport.id
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            <span>{sport.icon}</span>
            <span>{sport.name}</span>
          </button>
        ))}
      </div>

      {/* Week View */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {currentWeek.map((date, index) => {
          const dateStr = date.toDateString();
          const isToday = dateStr === todayStr;
          const dayMatches = getMatchesForDate(date);
          
          return (
            <div
              key={index}
              className={`p-2 text-center rounded-lg transition-colors ${
                isToday 
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-sm font-medium ${
                isToday ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'
              }`}>
                {date.getDate()}
              </div>
              {dayMatches.length > 0 && (
                <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto mt-1"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Today's Matches */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          Today's Matches
        </h4>
        
        {filteredMatches.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No matches scheduled for this period
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMatches.slice(0, 5).map((match, index) => {
              const status = getMatchStatus(match);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.homeTeam} vs {match.awayTeam}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {status === 'live' ? 'LIVE' : status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(match.date).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                      {match.venue && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{match.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{match.sport}</span>
                      </div>
                    </div>
                  </div>
                  
                  {status === 'live' && match.score && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {match.score.home} - {match.score.away}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {match.score.status}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredMatches.length > 5 && (
          <div className="text-center pt-2">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Matches ({filteredMatches.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get week dates
function getWeekDates(date) {
  const week = [];
  const startDate = new Date(date);
  const day = startDate.getDay();
  const diff = startDate.getDate() - day;
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(diff + i);
    week.push(currentDate);
  }
  
  return week;
}

export default CalendarWidget;
