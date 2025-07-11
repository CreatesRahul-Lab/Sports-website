const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['article', 'match', 'comment'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reactionType: {
    type: String,
    enum: ['like', 'love', 'laugh', 'angry', 'sad', 'wow', 'celebrate', 'fire'],
    required: true
  },
  comment: {
    type: String,
    maxlength: 500
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reaction'
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reaction'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
reactionSchema.index({ type: 1, targetId: 1, createdAt: -1 });
reactionSchema.index({ user: 1 });
reactionSchema.index({ parentComment: 1 });

// Compound index to prevent duplicate reactions
reactionSchema.index({ type: 1, targetId: 1, user: 1, reactionType: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);
