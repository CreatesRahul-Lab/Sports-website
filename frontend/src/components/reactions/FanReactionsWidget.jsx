import React from 'react';
import { Heart, Smile, Angry, Frown, ThumbsUp } from 'lucide-react';

const FanReactionsWidget = () => {
  // Mock data for now
  const reactions = [
    { type: 'love', count: 156, icon: Heart, color: 'text-red-500' },
    { type: 'like', count: 234, icon: ThumbsUp, color: 'text-blue-500' },
    { type: 'wow', count: 89, icon: Smile, color: 'text-yellow-500' },
    { type: 'angry', count: 34, icon: Angry, color: 'text-red-600' },
    { type: 'sad', count: 12, icon: Frown, color: 'text-gray-500' }
  ];

  const recentReactions = [
    { user: 'SportsFan23', reaction: 'love', comment: 'Amazing game!', time: '2m ago' },
    { user: 'CricketLover', reaction: 'wow', comment: 'What a shot!', time: '5m ago' },
    { user: 'FootballPro', reaction: 'like', comment: 'Great article', time: '10m ago' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Live Fan Reactions
      </h3>
      
      {/* Reaction Summary */}
      <div className="flex items-center space-x-4 mb-6">
        {reactions.map((reaction) => {
          const Icon = reaction.icon;
          return (
            <div key={reaction.type} className="flex items-center space-x-1">
              <Icon className={`w-5 h-5 ${reaction.color}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {reaction.count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent Reactions */}
      <div className="space-y-3">
        {recentReactions.map((reaction, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-600">
                {reaction.user.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {reaction.user}
                </span>
                <span className="text-xs text-gray-500">{reaction.time}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {reaction.comment}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
          View All Reactions
        </button>
      </div>
    </div>
  );
};

export default FanReactionsWidget;
