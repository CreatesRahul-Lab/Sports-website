const express = require('express');
const { query, validationResult } = require('express-validator');
const Match = require('../models/Match');
const LiveScoreService = require('../services/liveScoreService');

const router = express.Router();

// Get live scores
router.get('/', [
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey']),
  query('status').optional().isIn(['live', 'scheduled', 'finished']),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const limit = parseInt(req.query.limit) || 20;
    let query = {};

    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    if (req.query.status) {
      query.status = req.query.status;
    } else {
      // Default to live and scheduled matches
      query.status = { $in: ['live', 'scheduled'] };
    }

    const matches = await Match.find(query)
      .sort({ startTime: 1, status: 1 })
      .limit(limit);

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get live scores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific match details
router.get('/:matchId', async (req, res) => {
  try {
    const match = await Match.findOne({ matchId: req.params.matchId });
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }

    res.json({
      success: true,
      match
    });
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get live matches
router.get('/status/live', async (req, res) => {
  try {
    const liveMatches = await Match.find({ status: 'live' })
      .sort({ startTime: 1 });

    res.json({
      success: true,
      matches: liveMatches
    });
  } catch (error) {
    console.error('Get live matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming matches
router.get('/status/upcoming', [
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey']),
  query('days').optional().isInt({ min: 1, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 7;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    let query = {
      status: 'scheduled',
      startTime: {
        $gte: new Date(),
        $lte: endDate
      }
    };

    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    const matches = await Match.find(query)
      .sort({ startTime: 1 })
      .limit(50);

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get upcoming matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recent finished matches
router.get('/status/finished', [
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey']),
  query('days').optional().isInt({ min: 1, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = {
      status: 'finished',
      startTime: {
        $gte: startDate,
        $lte: new Date()
      }
    };

    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    const matches = await Match.find(query)
      .sort({ startTime: -1 })
      .limit(50);

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get finished matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get matches by team
router.get('/team/:teamName', async (req, res) => {
  try {
    const teamName = req.params.teamName;
    const matches = await Match.find({
      $or: [
        { 'homeTeam.name': { $regex: teamName, $options: 'i' } },
        { 'awayTeam.name': { $regex: teamName, $options: 'i' } }
      ]
    })
    .sort({ startTime: -1 })
    .limit(20);

    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Get team matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh live scores (manual trigger)
router.post('/refresh', async (req, res) => {
  try {
    const liveScoreService = new LiveScoreService();
    await liveScoreService.updateLiveScores();

    res.json({
      success: true,
      message: 'Live scores refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh live scores error:', error);
    res.status(500).json({ message: 'Failed to refresh live scores' });
  }
});

module.exports = router;
