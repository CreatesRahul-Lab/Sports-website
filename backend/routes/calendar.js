const express = require('express');
const { query, validationResult } = require('express-validator');
const Match = require('../models/Match');

const router = express.Router();

// Get calendar events
router.get('/', [
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey']),
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020, max: 2030 }),
  query('team').optional().isString(),
  query('country').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const currentDate = new Date();
    const month = parseInt(req.query.month) || currentDate.getMonth() + 1;
    const year = parseInt(req.query.year) || currentDate.getFullYear();

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let query = {
      startTime: {
        $gte: startDate,
        $lte: endDate
      }
    };

    // Add filters
    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    if (req.query.team) {
      query.$or = [
        { 'homeTeam.name': { $regex: req.query.team, $options: 'i' } },
        { 'awayTeam.name': { $regex: req.query.team, $options: 'i' } }
      ];
    }

    if (req.query.country) {
      query['venue.country'] = { $regex: req.query.country, $options: 'i' };
    }

    const matches = await Match.find(query)
      .sort({ startTime: 1 })
      .select('matchId sport league homeTeam awayTeam startTime status venue');

    // Group matches by date
    const calendar = {};
    matches.forEach(match => {
      const dateKey = match.startTime.toISOString().split('T')[0];
      if (!calendar[dateKey]) {
        calendar[dateKey] = [];
      }
      calendar[dateKey].push(match);
    });

    res.json({
      success: true,
      calendar,
      matches,
      month,
      year,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events for a specific date
router.get('/date/:date', [
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dateStr = req.params.date;
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Get start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let query = {
      startTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    };

    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    const matches = await Match.find(query)
      .sort({ startTime: 1 });

    res.json({
      success: true,
      date: dateStr,
      matches,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('Get date events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming events
router.get('/upcoming', [
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey']),
  query('days').optional().isInt({ min: 1, max: 90 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 7;
    const limit = parseInt(req.query.limit) || 50;

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    let query = {
      startTime: {
        $gte: now,
        $lte: endDate
      },
      status: 'scheduled'
    };

    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    const matches = await Match.find(query)
      .sort({ startTime: 1 })
      .limit(limit);

    res.json({
      success: true,
      matches,
      totalMatches: matches.length,
      period: `${days} days`
    });
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events by team
router.get('/team/:teamName', [
  query('months').optional().isInt({ min: 1, max: 12 }),
  query('upcoming').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const teamName = req.params.teamName;
    const months = parseInt(req.query.months) || 3;
    const upcomingOnly = req.query.upcoming === 'true';

    const now = new Date();
    const startDate = upcomingOnly ? now : new Date(now.getFullYear(), now.getMonth() - months, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + months, 0);

    let query = {
      $or: [
        { 'homeTeam.name': { $regex: teamName, $options: 'i' } },
        { 'awayTeam.name': { $regex: teamName, $options: 'i' } }
      ],
      startTime: {
        $gte: startDate,
        $lte: endDate
      }
    };

    if (upcomingOnly) {
      query.status = 'scheduled';
    }

    const matches = await Match.find(query)
      .sort({ startTime: upcomingOnly ? 1 : -1 })
      .limit(50);

    res.json({
      success: true,
      team: teamName,
      matches,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('Get team events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events by league
router.get('/league/:league', [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020, max: 2030 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const league = req.params.league;
    const currentDate = new Date();
    const month = parseInt(req.query.month) || currentDate.getMonth() + 1;
    const year = parseInt(req.query.year) || currentDate.getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const matches = await Match.find({
      league: { $regex: league, $options: 'i' },
      startTime: {
        $gte: startDate,
        $lte: endDate
      }
    })
    .sort({ startTime: 1 });

    res.json({
      success: true,
      league,
      matches,
      month,
      year,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('Get league events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tournament/competition fixtures
router.get('/tournament/:tournament', async (req, res) => {
  try {
    const tournament = req.params.tournament;
    
    const matches = await Match.find({
      $or: [
        { league: { $regex: tournament, $options: 'i' } },
        { 'venue.name': { $regex: tournament, $options: 'i' } }
      ]
    })
    .sort({ startTime: 1 })
    .limit(100);

    // Group matches by round/stage if possible
    const stages = {};
    matches.forEach(match => {
      const stage = match.stage || 'Regular Season';
      if (!stages[stage]) {
        stages[stage] = [];
      }
      stages[stage].push(match);
    });

    res.json({
      success: true,
      tournament,
      matches,
      stages,
      totalMatches: matches.length
    });
  } catch (error) {
    console.error('Get tournament events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get match schedule summary
router.get('/summary', [
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let baseQuery = {};
    if (req.query.sport) {
      baseQuery.sport = req.query.sport;
    }

    const [todayMatches, tomorrowMatches, weekMatches, liveMatches] = await Promise.all([
      Match.countDocuments({
        ...baseQuery,
        startTime: {
          $gte: today,
          $lt: tomorrow
        }
      }),
      Match.countDocuments({
        ...baseQuery,
        startTime: {
          $gte: tomorrow,
          $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      }),
      Match.countDocuments({
        ...baseQuery,
        startTime: {
          $gte: today,
          $lt: weekEnd
        }
      }),
      Match.countDocuments({
        ...baseQuery,
        status: 'live'
      })
    ]);

    res.json({
      success: true,
      summary: {
        today: todayMatches,
        tomorrow: tomorrowMatches,
        thisWeek: weekMatches,
        live: liveMatches
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
