const express = require('express');
const { body, validationResult } = require('express-validator');
const FantasyPrediction = require('../models/FantasyPrediction');
const GeminiService = require('../services/geminiService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get fantasy predictions for current week
router.get('/current', async (req, res) => {
  try {
    const sport = req.query.sport || 'football';
    const currentWeek = getCurrentWeek();

    let predictions = await FantasyPrediction.findOne({
      sport,
      week: currentWeek,
      isActive: true
    }).sort({ createdAt: -1 });

    // If no predictions found, create sample data
    if (!predictions) {
      predictions = new FantasyPrediction({
        sport,
        week: currentWeek,
        league: 'NFL', // Add required league field
        isActive: true,
        predictions: [
          {
            playerId: 'player1',
            playerName: 'Josh Allen',
            position: 'QB',
            team: 'BUF',
            predictedPoints: 24.5,
            confidence: 'high',
            reasoning: 'Strong matchup against weak defense'
          },
          {
            playerId: 'player2',
            playerName: 'Christian McCaffrey',
            position: 'RB',
            team: 'SF',
            predictedPoints: 22.3,
            confidence: 'high',
            reasoning: 'Heavy workload expected'
          },
          {
            playerId: 'player3',
            playerName: 'Tyreek Hill',
            position: 'WR',
            team: 'MIA',
            predictedPoints: 18.7,
            confidence: 'medium',
            reasoning: 'High target share in favorable matchup'
          }
        ],
        captainPicks: [
          {
            playerId: 'player1',
            playerName: 'Josh Allen',
            team: 'BUF',
            reasoning: 'Highest ceiling this week',
            confidence: 0.85
          }
        ],
        differentialPicks: [
          {
            playerId: 'player4',
            playerName: 'Jaylen Waddle',
            team: 'MIA',
            ownership: 15.2,
            reasoning: 'Low ownership with high upside'
          }
        ],
        aiAnalysis: {
          summary: 'Week focuses on high-scoring games with QB upside',
          keyInsights: ['Weather could be a factor', 'Monitor injury reports'],
          riskLevel: 'medium'
        }
      });
      await predictions.save();
    }

    res.json({
      success: true,
      predictions
    });
  } catch (error) {
    console.error('Get current predictions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get fantasy predictions by week
router.get('/week/:week', async (req, res) => {
  try {
    const week = parseInt(req.params.week);
    const sport = req.query.sport || 'football';

    const predictions = await FantasyPrediction.findOne({
      sport,
      week,
      isActive: true
    });

    if (!predictions) {
      return res.status(404).json({ message: 'No predictions available for this week' });
    }

    res.json({
      success: true,
      predictions
    });
  } catch (error) {
    console.error('Get week predictions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new fantasy predictions
router.post('/generate', [
  authMiddleware,
  body('sport').isIn(['cricket', 'football', 'basketball', 'tennis']),
  body('league').notEmpty(),
  body('week').isInt({ min: 1, max: 52 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sport, league, week } = req.body;

    // Check if predictions already exist for this week
    const existingPredictions = await FantasyPrediction.findOne({
      sport,
      league,
      week,
      isActive: true
    });

    if (existingPredictions) {
      return res.status(400).json({ message: 'Predictions already exist for this week' });
    }

    // Mock match data and player stats (in production, fetch from APIs)
    const mockMatchData = {
      fixtures: [
        {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          difficulty: 'medium',
          venue: 'home'
        }
      ]
    };

    const mockPlayerStats = {
      players: [
        {
          id: '1',
          name: 'Player One',
          team: 'Team A',
          position: 'Forward',
          form: 8.5,
          price: 10.5,
          ownership: 25.6
        }
      ]
    };

    // Generate predictions using Gemini AI
    const aiPredictions = await GeminiService.generateFantasyPredictions(
      mockMatchData,
      mockPlayerStats
    );

    // Create fantasy prediction document
    const prediction = new FantasyPrediction({
      week,
      sport,
      league,
      predictions: aiPredictions.predictions || [],
      captainPicks: aiPredictions.captainPicks || [],
      differentialPicks: aiPredictions.differentialPicks || [],
      transferSuggestions: aiPredictions.transferSuggestions || [],
      aiAnalysis: {
        summary: aiPredictions.summary || 'AI analysis not available',
        keyInsights: aiPredictions.keyInsights || [],
        riskLevel: aiPredictions.riskLevel || 'medium'
      }
    });

    await prediction.save();

    res.status(201).json({
      success: true,
      predictions: prediction
    });
  } catch (error) {
    console.error('Generate predictions error:', error);
    res.status(500).json({ message: 'Failed to generate predictions' });
  }
});

// Get captain picks
router.get('/captain-picks', async (req, res) => {
  try {
    const sport = req.query.sport || 'football';
    const currentWeek = getCurrentWeek();

    const predictions = await FantasyPrediction.findOne({
      sport,
      week: currentWeek,
      isActive: true
    }).select('captainPicks week sport');

    if (!predictions) {
      return res.status(404).json({ message: 'No captain picks available' });
    }

    res.json({
      success: true,
      captainPicks: predictions.captainPicks,
      week: predictions.week
    });
  } catch (error) {
    console.error('Get captain picks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get differential picks
router.get('/differential-picks', async (req, res) => {
  try {
    const sport = req.query.sport || 'football';
    const currentWeek = getCurrentWeek();

    const predictions = await FantasyPrediction.findOne({
      sport,
      week: currentWeek,
      isActive: true
    }).select('differentialPicks week sport');

    if (!predictions) {
      return res.status(404).json({ message: 'No differential picks available' });
    }

    res.json({
      success: true,
      differentialPicks: predictions.differentialPicks,
      week: predictions.week
    });
  } catch (error) {
    console.error('Get differential picks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transfer suggestions
router.get('/transfer-suggestions', async (req, res) => {
  try {
    const sport = req.query.sport || 'football';
    const currentWeek = getCurrentWeek();

    const predictions = await FantasyPrediction.findOne({
      sport,
      week: currentWeek,
      isActive: true
    }).select('transferSuggestions week sport');

    if (!predictions) {
      return res.status(404).json({ message: 'No transfer suggestions available' });
    }

    res.json({
      success: true,
      transferSuggestions: predictions.transferSuggestions,
      week: predictions.week
    });
  } catch (error) {
    console.error('Get transfer suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get AI analysis
router.get('/ai-analysis', async (req, res) => {
  try {
    const sport = req.query.sport || 'football';
    const currentWeek = getCurrentWeek();

    const predictions = await FantasyPrediction.findOne({
      sport,
      week: currentWeek,
      isActive: true
    }).select('aiAnalysis week sport');

    if (!predictions) {
      return res.status(404).json({ message: 'No AI analysis available' });
    }

    res.json({
      success: true,
      aiAnalysis: predictions.aiAnalysis,
      week: predictions.week
    });
  } catch (error) {
    console.error('Get AI analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get historical predictions
router.get('/history', async (req, res) => {
  try {
    const sport = req.query.sport || 'football';
    const limit = parseInt(req.query.limit) || 10;

    const predictions = await FantasyPrediction.find({
      sport,
      isActive: true
    })
    .sort({ week: -1 })
    .limit(limit)
    .select('week sport captainPicks aiAnalysis createdAt');

    res.json({
      success: true,
      predictions
    });
  } catch (error) {
    console.error('Get prediction history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update prediction (admin only)
router.put('/:id', [
  authMiddleware,
  body('captainPicks').optional().isArray(),
  body('differentialPicks').optional().isArray(),
  body('transferSuggestions').optional().isArray()
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const prediction = await FantasyPrediction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Update prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete prediction (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const prediction = await FantasyPrediction.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!prediction) {
      return res.status(404).json({ message: 'Prediction not found' });
    }

    res.json({
      success: true,
      message: 'Prediction deleted'
    });
  } catch (error) {
    console.error('Delete prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get current week
function getCurrentWeek() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

module.exports = router;
