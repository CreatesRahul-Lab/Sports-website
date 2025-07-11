const express = require('express');
const { body, validationResult } = require('express-validator');
const Reaction = require('../models/Reaction');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get reactions for a target (article or match)
router.get('/:type/:targetId', async (req, res) => {
  try {
    const { type, targetId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!['article', 'match'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const reactions = await Reaction.find({
      type,
      targetId,
      isActive: true,
      parentComment: null // Only get top-level reactions
    })
    .populate('user', 'username avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'user',
        select: 'username avatar'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Reaction.countDocuments({
      type,
      targetId,
      isActive: true,
      parentComment: null
    });

    // Get reaction counts
    const reactionCounts = await Reaction.aggregate([
      {
        $match: {
          type,
          targetId,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$reactionType',
          count: { $sum: 1 }
        }
      }
    ]);

    const counts = {};
    reactionCounts.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json({
      success: true,
      reactions,
      counts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReactions: total
      }
    });
  } catch (error) {
    console.error('Get reactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction
router.post('/', [
  authMiddleware,
  body('type').isIn(['article', 'match']),
  body('targetId').notEmpty(),
  body('reactionType').isIn(['like', 'love', 'laugh', 'angry', 'sad', 'wow', 'celebrate', 'fire']),
  body('comment').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, targetId, reactionType, comment } = req.body;

    // Check if user already reacted with this type
    const existingReaction = await Reaction.findOne({
      type,
      targetId,
      user: req.user._id,
      reactionType
    });

    if (existingReaction) {
      return res.status(400).json({ message: 'You already reacted with this type' });
    }

    const reaction = new Reaction({
      type,
      targetId,
      user: req.user._id,
      reactionType,
      comment
    });

    await reaction.save();
    await reaction.populate('user', 'username avatar');

    // Emit real-time update
    if (req.io) {
      req.io.to(`${type}_${targetId}`).emit('newReaction', reaction);
    }

    res.status(201).json({
      success: true,
      reaction
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to reaction
router.post('/:reactionId/reply', [
  authMiddleware,
  body('comment').isLength({ min: 1, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const parentReaction = await Reaction.findById(req.params.reactionId);
    if (!parentReaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    const reply = new Reaction({
      type: 'comment',
      targetId: parentReaction.targetId,
      user: req.user._id,
      reactionType: 'like', // Default for replies
      comment: req.body.comment,
      parentComment: parentReaction._id
    });

    await reply.save();
    await reply.populate('user', 'username avatar');

    // Add reply to parent reaction
    parentReaction.replies.push(reply._id);
    await parentReaction.save();

    // Emit real-time update
    if (req.io) {
      req.io.to(`${parentReaction.type}_${parentReaction.targetId}`).emit('newReply', {
        parentId: parentReaction._id,
        reply
      });
    }

    res.status(201).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike reaction
router.post('/:reactionId/like', authMiddleware, async (req, res) => {
  try {
    const reaction = await Reaction.findById(req.params.reactionId);
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    // Toggle like (simplified - in production, track individual likes)
    reaction.likes += 1;
    await reaction.save();

    res.json({
      success: true,
      likes: reaction.likes
    });
  } catch (error) {
    console.error('Like reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete reaction
router.delete('/:reactionId', authMiddleware, async (req, res) => {
  try {
    const reaction = await Reaction.findById(req.params.reactionId);
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }

    // Check if user owns the reaction or is admin
    if (reaction.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    reaction.isActive = false;
    await reaction.save();

    res.json({
      success: true,
      message: 'Reaction deleted'
    });
  } catch (error) {
    console.error('Delete reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending reactions
router.get('/trending/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const hours = parseInt(req.query.hours) || 24;
    const limit = parseInt(req.query.limit) || 10;

    if (!['article', 'match'].includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const trendingReactions = await Reaction.aggregate([
      {
        $match: {
          type,
          isActive: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$targetId',
          reactionCount: { $sum: 1 },
          likes: { $sum: '$likes' },
          latestReaction: { $max: '$createdAt' }
        }
      },
      {
        $sort: { reactionCount: -1, likes: -1 }
      },
      {
        $limit: limit
      }
    ]);

    res.json({
      success: true,
      trending: trendingReactions
    });
  } catch (error) {
    console.error('Get trending reactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
