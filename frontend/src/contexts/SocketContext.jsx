import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveScores, setLiveScores] = useState({});
  const [fanReactions, setFanReactions] = useState({});
  const [chatMessages, setChatMessages] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
      autoConnect: false,
      transports: ['websocket'],
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    // Live score updates
    newSocket.on('matchUpdate', (matchData) => {
      setLiveScores(prev => ({
        ...prev,
        [matchData.matchId]: matchData
      }));
    });

    // Fan reactions
    newSocket.on('fanReaction', (reactionData) => {
      setFanReactions(prev => ({
        ...prev,
        [reactionData.targetId]: [
          ...(prev[reactionData.targetId] || []),
          reactionData
        ]
      }));
    });

    newSocket.on('newReaction', (reactionData) => {
      setFanReactions(prev => ({
        ...prev,
        [reactionData.targetId]: [
          ...(prev[reactionData.targetId] || []),
          reactionData
        ]
      }));
    });

    // Chat messages
    newSocket.on('chatMessage', (messageData) => {
      setChatMessages(prev => ({
        ...prev,
        [messageData.matchId]: [
          ...(prev[messageData.matchId] || []),
          messageData
        ]
      }));
    });

    newSocket.on('botResponse', (responseData) => {
      setChatMessages(prev => ({
        ...prev,
        [responseData.matchId]: [
          ...(prev[responseData.matchId] || []),
          responseData
        ]
      }));
    });

    // Error handling
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    // Connect when user is authenticated
    if (user) {
      newSocket.connect();
    }

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Join match room for live updates
  const joinMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('joinMatch', matchId);
    }
  };

  // Leave match room
  const leaveMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('leaveMatch', matchId);
    }
  };

  // Join article room for reactions
  const joinArticle = (articleId) => {
    if (socket && isConnected) {
      socket.emit('joinArticle', articleId);
    }
  };

  // Leave article room
  const leaveArticle = (articleId) => {
    if (socket && isConnected) {
      socket.emit('leaveArticle', articleId);
    }
  };

  // Send fan reaction
  const sendFanReaction = (reactionData) => {
    if (socket && isConnected) {
      socket.emit('fanReaction', reactionData);
    }
  };

  // Send chat message
  const sendChatMessage = (messageData) => {
    if (socket && isConnected) {
      socket.emit('chatMessage', messageData);
    }
  };

  // Clear chat messages for a match
  const clearChatMessages = (matchId) => {
    setChatMessages(prev => ({
      ...prev,
      [matchId]: []
    }));
  };

  // Clear fan reactions for a target
  const clearFanReactions = (targetId) => {
    setFanReactions(prev => ({
      ...prev,
      [targetId]: []
    }));
  };

  // Get live score for a match
  const getLiveScore = (matchId) => {
    return liveScores[matchId] || null;
  };

  // Get fan reactions for a target
  const getFanReactions = (targetId) => {
    return fanReactions[targetId] || [];
  };

  // Get chat messages for a match
  const getChatMessages = (matchId) => {
    return chatMessages[matchId] || [];
  };

  const value = {
    socket,
    isConnected,
    liveScores,
    fanReactions,
    chatMessages,
    joinMatch,
    leaveMatch,
    joinArticle,
    leaveArticle,
    sendFanReaction,
    sendChatMessage,
    clearChatMessages,
    clearFanReactions,
    getLiveScore,
    getFanReactions,
    getChatMessages,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
