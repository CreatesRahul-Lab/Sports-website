const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchId: {
    type: String,
    required: true,
    unique: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey']
  },
  league: {
    type: String,
    required: true
  },
  homeTeam: {
    id: String,
    name: String,
    logo: String,
    score: { type: Number, default: 0 }
  },
  awayTeam: {
    id: String,
    name: String,
    logo: String,
    score: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'finished', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  startTime: {
    type: Date,
    required: true
  },
  venue: {
    name: String,
    city: String,
    country: String
  },
  liveData: {
    currentTime: String,
    period: String,
    events: [{
      type: String,
      time: String,
      player: String,
      team: String,
      description: String
    }],
    stats: {
      possession: {
        home: Number,
        away: Number
      },
      shots: {
        home: Number,
        away: Number
      },
      corners: {
        home: Number,
        away: Number
      },
      fouls: {
        home: Number,
        away: Number
      }
    }
  },
  // Cricket specific fields
  cricketData: {
    overs: {
      homeTeam: Number,
      awayTeam: Number
    },
    wickets: {
      homeTeam: Number,
      awayTeam: Number
    },
    runRate: {
      homeTeam: Number,
      awayTeam: Number
    },
    currentBatsmen: [{
      name: String,
      runs: Number,
      balls: Number
    }],
    currentBowler: {
      name: String,
      overs: Number,
      runs: Number,
      wickets: Number
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
matchSchema.index({ sport: 1, status: 1, startTime: -1 });
matchSchema.index({ matchId: 1 });
matchSchema.index({ startTime: 1 });

module.exports = mongoose.model('Match', matchSchema);
