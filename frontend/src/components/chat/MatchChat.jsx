import React, { useState, useEffect } from 'react';
import { MessageCircle, Heart, Send, ThumbsUp, ThumbsDown, Flag, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const MatchChat = ({ matchId, isLive = false }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (socket && matchId) {
      // Join match chat room
      socket.emit('join-match-chat', matchId);
      setIsConnected(true);

      // Listen for messages
      socket.on('match-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for user count updates
      socket.on('chat-users-count', (count) => {
        setActiveUsers(count);
      });

      // Listen for reactions
      socket.on('match-reaction', (reaction) => {
        setMessages(prev => [...prev, {
          type: 'reaction',
          ...reaction
        }]);
      });

      return () => {
        socket.emit('leave-match-chat', matchId);
        socket.off('match-message');
        socket.off('chat-users-count');
        socket.off('match-reaction');
      };
    }
  }, [socket, matchId]);

  const sendMessage = () => {
    if (newMessage.trim() && socket && user) {
      const message = {
        matchId,
        userId: user._id,
        username: user.username,
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      socket.emit('send-match-message', message);
      setNewMessage('');
    }
  };

  const sendReaction = (type) => {
    if (socket && user) {
      const reaction = {
        matchId,
        userId: user._id,
        username: user.username,
        type,
        timestamp: new Date().toISOString()
      };

      socket.emit('send-match-reaction', reaction);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const reactions = [
    { type: 'goal', emoji: '⚽', label: 'Goal!' },
    { type: 'fire', emoji: '🔥', label: 'Fire!' },
    { type: 'wow', emoji: '😮', label: 'Wow!' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'angry', emoji: '😠', label: 'Angry' },
    { type: 'love', emoji: '❤️', label: 'Love' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Match Chat
          </h3>
          {isLive && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <Users className="w-4 h-4" />
          <span>{activeUsers}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`${
                msg.type === 'reaction' ? 'text-center' : 'text-left'
              }`}
            >
              {msg.type === 'reaction' ? (
                <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                  <span className="text-lg">{reactions.find(r => r.type === msg.type)?.emoji}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {msg.username} reacted
                  </span>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {msg.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {msg.username}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getMessageTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {msg.message}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
      </div>

      {/* Quick Reactions */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => sendReaction(reaction.type)}
              className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={reaction.label}
            >
              <span className="text-lg">{reaction.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {user ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please log in to participate in the chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchChat;
