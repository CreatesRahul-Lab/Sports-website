const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 500
  },
  aiSummary: {
    type: String,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'football', 'basketball', 'tennis', 'baseball', 'hockey', 'general']
  },
  tags: [{
    type: String,
    trim: true
  }],
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  images: [{
    url: String,
    alt: String,
    caption: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 0
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  audioUrl: {
    type: String // TTS generated audio URL
  },
  publishedAt: {
    type: Date
  },
  seoMetadata: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ sport: 1, status: 1, publishedAt: -1 });
articleSchema.index({ slug: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ featured: 1, trending: 1 });

// Pre-save middleware to generate slug
articleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Calculate read time based on content length
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  next();
});

// Virtual for URL
articleSchema.virtual('url').get(function() {
  return `/articles/${this.slug}`;
});

module.exports = mongoose.model('Article', articleSchema);
