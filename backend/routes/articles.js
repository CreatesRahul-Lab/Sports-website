const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Article = require('../models/Article');
const { authMiddleware, authorMiddleware } = require('../middleware/auth');
const GeminiService = require('../services/geminiService');
const TTSService = require('../services/ttsService');

const router = express.Router();

// Get all articles with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey', 'general']),
  query('filter').optional().isIn(['latest', 'popular', 'trending', 'featured']),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { status: 'published' };
    let sortOptions = {};

    // Filter by sport
    if (req.query.sport) {
      query.sport = req.query.sport;
    }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Apply filters
    switch (req.query.filter) {
      case 'popular':
        sortOptions = { views: -1, likes: -1 };
        break;
      case 'trending':
        query.trending = true;
        sortOptions = { publishedAt: -1 };
        break;
      case 'featured':
        query.featured = true;
        sortOptions = { publishedAt: -1 };
        break;
      default:
        sortOptions = { publishedAt: -1 };
    }

    const articles = await Article.find(query)
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-content'); // Exclude full content for list view

    const total = await Article.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      articles,
      pagination: {
        currentPage: page,
        totalPages,
        totalArticles: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single article by slug
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    })
    .populate('author', 'username avatar')
    .populate('relatedArticles', 'title slug featuredImage publishedAt readTime');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new article
router.post('/', [
  authMiddleware,
  authorMiddleware,
  body('title').isLength({ min: 5, max: 200 }).trim(),
  body('content').isLength({ min: 50 }),
  body('sport').isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey', 'general']),
  body('tags').optional().isArray(),
  body('summary').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      sport,
      tags,
      summary,
      featuredImage,
      status = 'draft'
    } = req.body;

    const article = new Article({
      title,
      content,
      sport,
      tags,
      summary,
      featuredImage,
      status,
      author: req.user._id,
      publishedAt: status === 'published' ? new Date() : null
    });

    await article.save();

    // Generate AI summary if published
    if (status === 'published') {
      try {
        const aiSummary = await GeminiService.generateSummary(content);
        article.aiSummary = aiSummary;
        await article.save();
      } catch (summaryError) {
        console.error('AI summary generation error:', summaryError);
      }
    }

    res.status(201).json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update article
router.put('/:id', [
  authMiddleware,
  authorMiddleware,
  body('title').optional().isLength({ min: 5, max: 200 }).trim(),
  body('content').optional().isLength({ min: 50 }),
  body('sport').optional().isIn(['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey', 'general']),
  body('tags').optional().isArray(),
  body('summary').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this article' });
    }

    const updateData = req.body;
    
    // If status is being changed to published, set publishedAt
    if (updateData.status === 'published' && article.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    // Generate AI summary if content changed and published
    if (updateData.content && updatedArticle.status === 'published') {
      try {
        const aiSummary = await GeminiService.generateSummary(updateData.content);
        updatedArticle.aiSummary = aiSummary;
        await updatedArticle.save();
      } catch (summaryError) {
        console.error('AI summary generation error:', summaryError);
      }
    }

    res.json({
      success: true,
      article: updatedArticle
    });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete article
router.delete('/:id', authMiddleware, authorMiddleware, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if user is the author or admin
    if (article.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate AI summary for article
router.post('/:id/ai-summary', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const aiSummary = await GeminiService.generateSummary(article.content);
    
    article.aiSummary = aiSummary;
    await article.save();

    res.json({
      success: true,
      summary: aiSummary
    });
  } catch (error) {
    console.error('AI summary error:', error);
    res.status(500).json({ message: 'Failed to generate AI summary' });
  }
});

// Generate TTS audio for article
router.post('/:id/audio', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const audioUrl = await TTSService.generateAudio(article.content, article.title);
    
    article.audioUrl = audioUrl;
    await article.save();

    res.json({
      success: true,
      audioUrl
    });
  } catch (error) {
    console.error('TTS generation error:', error);
    res.status(500).json({ message: 'Failed to generate audio' });
  }
});

// Like article
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.likes += 1;
    await article.save();

    res.json({
      success: true,
      likes: article.likes
    });
  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share article
router.post('/:id/share', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    article.shares += 1;
    await article.save();

    res.json({
      success: true,
      shares: article.shares
    });
  } catch (error) {
    console.error('Share article error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending articles
router.get('/feed/trending', async (req, res) => {
  try {
    const articles = await Article.find({
      status: 'published',
      trending: true
    })
    .populate('author', 'username avatar')
    .sort({ publishedAt: -1 })
    .limit(10)
    .select('-content');

    res.json({
      success: true,
      articles
    });
  } catch (error) {
    console.error('Get trending articles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get personalized feed
router.get('/feed/personalized', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const followedSports = user.preferences.followedSports || [];
    const followedTeams = user.preferences.followedTeams || [];

    let query = { status: 'published' };

    if (followedSports.length > 0) {
      query.sport = { $in: followedSports };
    }

    // If user follows specific teams, prioritize articles with those team tags
    if (followedTeams.length > 0) {
      const teamNames = followedTeams.map(team => team.teamName);
      query.tags = { $in: teamNames };
    }

    const articles = await Article.find(query)
      .populate('author', 'username avatar')
      .sort({ publishedAt: -1 })
      .limit(20)
      .select('-content');

    res.json({
      success: true,
      articles
    });
  } catch (error) {
    console.error('Get personalized feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
