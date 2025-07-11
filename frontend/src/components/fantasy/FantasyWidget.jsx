import React from 'react';
import { Crown, TrendingUp, Star, Users } from 'lucide-react';

const FantasyWidget = ({ predictions }) => {
  if (!predictions) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Fantasy Predictions
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            AI-powered fantasy recommendations coming soon
          </p>
        </div>
      </div>
    );
  }

  const topCaptains = predictions.captainPicks?.slice(0, 3) || [];
  const topDifferentials = predictions.differentialPicks?.slice(0, 2) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Fantasy Picks
        </h3>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Star className="w-3 h-3" />
          <span>Week {predictions.week}</span>
        </div>
      </div>

      {/* Captain Picks */}
      <div className="mb-6">
        <h4 className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
          <Crown className="w-4 h-4 text-yellow-500" />
          <span>Top Captain Picks</span>
        </h4>
        <div className="space-y-2">
          {topCaptains.map((captain, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {captain.playerName}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {captain.team}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-gray-500">
                  {captain.confidence}% confidence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Differential Picks */}
      <div className="mb-6">
        <h4 className="flex items-center space-x-2 text-sm font-medium text-gray-900 dark:text-white mb-3">
          <Users className="w-4 h-4 text-blue-500" />
          <span>Differential Picks</span>
        </h4>
        <div className="space-y-2">
          {topDifferentials.map((differential, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {differential.playerName}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {differential.team}
                </span>
              </div>
              <span className="text-xs text-blue-600 font-medium">
                {differential.ownership}% owned
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis */}
      {predictions.aiAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            AI Analysis
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
            {predictions.aiAnalysis.summary}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
          View Full Analysis
        </button>
      </div>
    </div>
  );
};

export default FantasyWidget;
