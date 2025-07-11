const mongoose = require('mongoose');

const fantasyPredictionSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'football', 'basketball', 'tennis']
  },
  league: {
    type: String,
    required: true
  },
  predictions: [{
    playerId: String,
    playerName: String,
    team: String,
    position: String,
    predictedPoints: Number,
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    reasoning: String,
    factors: [{
      type: String,
      impact: String
    }]
  }],
  captainPicks: [{
    playerId: String,
    playerName: String,
    team: String,
    reasoning: String,
    confidence: Number
  }],
  differentialPicks: [{
    playerId: String,
    playerName: String,
    team: String,
    ownership: Number,
    reasoning: String
  }],
  transferSuggestions: [{
    playerOut: {
      id: String,
      name: String,
      team: String
    },
    playerIn: {
      id: String,
      name: String,
      team: String
    },
    reasoning: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  aiAnalysis: {
    summary: String,
    keyInsights: [String],
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
fantasyPredictionSchema.index({ sport: 1, league: 1, week: -1 });
fantasyPredictionSchema.index({ week: 1, isActive: 1 });

module.exports = mongoose.model('FantasyPrediction', fantasyPredictionSchema);
