const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const liveScoreRoutes = require('./routes/liveScores');
const reactionRoutes = require('./routes/reactions');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const fantasyRoutes = require('./routes/fantasy');
const calendarRoutes = require('./routes/calendar');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Import services
const LiveScoreService = require('./services/liveScoreService');
const GeminiService = require('./services/geminiService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-news', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join room for live score updates
  socket.on('joinMatch', (matchId) => {
    socket.join(`match_${matchId}`);
    console.log(`User ${socket.id} joined match room: ${matchId}`);
  });

  // Join room for article comments
  socket.on('joinArticle', (articleId) => {
    socket.join(`article_${articleId}`);
    console.log(`User ${socket.id} joined article room: ${articleId}`);
  });

  // Handle chat messages
  socket.on('chatMessage', (data) => {
    io.to(`match_${data.matchId}`).emit('chatMessage', data);
  });

  // Handle fan reactions
  socket.on('fanReaction', (data) => {
    io.to(`match_${data.matchId}`).emit('fanReaction', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/live-scores', liveScoreRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/fantasy', fantasyRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize live score service
  const liveScoreService = new LiveScoreService(io);
  liveScoreService.startUpdates();
});

module.exports = app;
