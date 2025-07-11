const express = require('express');
const { body, validationResult } = require('express-validator');
const GeminiService = require('../services/geminiService');
const Match = require('../models/Match');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get chat messages for a match
router.get('/:matchId/messages', async (req, res) => {
  try {
    const { matchId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    // In a real implementation, you'd store chat messages in a database
    // For now, we'll return a mock response
    const messages = [
      {
        id: '1',
        user: 'Fan1',
        message: 'Great match so far!',
        timestamp: new Date(),
        type: 'user'
      },
      {
        id: '2',
        user: 'MatchBot',
        message: 'The first half was intense with both teams creating good chances.',
        timestamp: new Date(),
        type: 'bot'
      }
    ];

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message to match chat
router.post('/:matchId/message', [
  authMiddleware,
  body('message').isLength({ min: 1, max: 500 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { matchId } = req.params;
    const { message } = req.body;

    // Get match details
    const match = await Match.findOne({ matchId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Create message object
    const chatMessage = {
      id: Date.now().toString(),
      user: req.user.username,
      userId: req.user._id,
      message,
      timestamp: new Date(),
      type: 'user'
    };

    // Emit message to all users in the match room
    if (req.io) {
      req.io.to(`match_${matchId}`).emit('chatMessage', chatMessage);
    }

    res.status(201).json({
      success: true,
      message: chatMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ask MatchBot a question
router.post('/:matchId/ask-bot', [
  authMiddleware,
  body('question').isLength({ min: 1, max: 200 }).trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { matchId } = req.params;
    const { question } = req.body;

    // Get match context
    const match = await Match.findOne({ matchId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Prepare match context for AI
    const matchContext = {
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: {
        home: match.homeTeam.score,
        away: match.awayTeam.score
      },
      status: match.status,
      currentTime: match.liveData?.currentTime || '',
      events: match.liveData?.events || [],
      sport: match.sport
    };

    // Generate AI response
    const aiResponse = await GeminiService.generateMatchBotResponse(question, matchContext);

    // Create bot message
    const botMessage = {
      id: Date.now().toString(),
      user: 'MatchBot',
      message: aiResponse,
      timestamp: new Date(),
      type: 'bot',
      questionAsked: question,
      askedBy: req.user.username
    };

    // Emit bot response to match room
    if (req.io) {
      req.io.to(`match_${matchId}`).emit('botResponse', botMessage);
    }

    res.json({
      success: true,
      response: botMessage
    });
  } catch (error) {
    console.error('Ask bot error:', error);
    res.status(500).json({ message: 'Failed to get bot response' });
  }
});

// Get match analysis from bot
router.get('/:matchId/analysis', async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match details
    const match = await Match.findOne({ matchId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Prepare match context
    const matchContext = {
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      score: {
        home: match.homeTeam.score,
        away: match.awayTeam.score
      },
      status: match.status,
      currentTime: match.liveData?.currentTime || '',
      events: match.liveData?.events || [],
      stats: match.liveData?.stats || {},
      sport: match.sport
    };

    // Generate match analysis
    const analysis = await GeminiService.generateMatchBotResponse(
      'Provide a detailed analysis of this match including key events, player performances, and tactical insights.',
      matchContext
    );

    res.json({
      success: true,
      analysis,
      matchContext
    });
  } catch (error) {
    console.error('Get match analysis error:', error);
    res.status(500).json({ message: 'Failed to generate match analysis' });
  }
});

// Get match predictions
router.get('/:matchId/predictions', async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match details
    const match = await Match.findOne({ matchId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Only provide predictions for upcoming matches
    if (match.status !== 'scheduled') {
      return res.status(400).json({ message: 'Predictions only available for upcoming matches' });
    }

    // Prepare match context
    const matchContext = {
      homeTeam: match.homeTeam.name,
      awayTeam: match.awayTeam.name,
      sport: match.sport,
      league: match.league,
      venue: match.venue
    };

    // Generate predictions
    const predictions = await GeminiService.generateMatchBotResponse(
      'Provide match predictions including likely outcome, key players to watch, and score prediction.',
      matchContext
    );

    res.json({
      success: true,
      predictions,
      matchInfo: {
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
        startTime: match.startTime,
        venue: match.venue
      }
    });
  } catch (error) {
    console.error('Get match predictions error:', error);
    res.status(500).json({ message: 'Failed to generate predictions' });
  }
});

// Get popular questions for a match
router.get('/:matchId/popular-questions', async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match details
    const match = await Match.findOne({ matchId });
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    // Return popular questions based on match sport and status
    const popularQuestions = getPopularQuestions(match.sport, match.status);

    res.json({
      success: true,
      questions: popularQuestions
    });
  } catch (error) {
    console.error('Get popular questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get popular questions
function getPopularQuestions(sport, status) {
  const questions = {
    football: {
      live: [
        "What happened in the first half?",
        "Who's been the best player so far?",
        "What are the key tactical changes?",
        "How many shots on target?",
        "What's the possession statistics?"
      ],
      scheduled: [
        "What's the predicted lineup?",
        "Who will score first?",
        "What's the head-to-head record?",
        "What are the injury updates?",
        "What's the weather forecast?"
      ],
      finished: [
        "Who was the man of the match?",
        "What were the key moments?",
        "How did the tactics work?",
        "What are the post-match reactions?",
        "What's next for both teams?"
      ]
    },
    cricket: {
      live: [
        "What's the current run rate?",
        "Who are the current batsmen?",
        "What's the bowling analysis?",
        "How many overs left?",
        "What's the target score?"
      ],
      scheduled: [
        "What's the pitch report?",
        "Who are the key players?",
        "What's the weather forecast?",
        "What's the recent form?",
        "What's the playing XI?"
      ],
      finished: [
        "Who was the player of the match?",
        "What were the key partnerships?",
        "How did the bowlers perform?",
        "What's the points table impact?",
        "What are the highlights?"
      ]
    }
  };

  return questions[sport]?.[status] || [
    "Tell me about this match",
    "What should I know?",
    "Who are the key players?",
    "What's the recent form?",
    "Any interesting facts?"
  ];
}

module.exports = router;
