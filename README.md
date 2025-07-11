# 🏆 Sports Website

A modern, full-stack sports news and fantasy platform built with React, Node.js, and MongoDB. Get real-time scores, personalized news feeds, fantasy predictions, and interactive fan experiences.

## ✨ Features

### 🏈 Core Features
- **Live Scores**: Real-time sports scores and match updates
- **News Feed**: Personalized sports news and trending articles
- **Fantasy Sports**: AI-powered fantasy predictions and insights
- **Interactive Calendar**: Sports events and match scheduling
- **Fan Reactions**: Real-time fan engagement and reactions
- **Audio Content**: Text-to-speech for articles and news

### 🎯 Advanced Features
- **Real-time Chat**: Live match discussions and fan interactions
- **Search & Filter**: Advanced search across sports content
- **Responsive Design**: Mobile-first, responsive UI
- **Dark/Light Theme**: Toggle between themes
- **Social Sharing**: Share content across platforms
- **User Authentication**: Secure login and user management

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens

### APIs & Services
- **Gemini AI** - AI-powered content generation
- **Sports APIs** - Live scores and sports data
- **Google Cloud TTS** - Text-to-speech service
- **Email Service** - User notifications

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/CreatesRahul-Lab/Sports-website.git
cd Sports-website
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sports-news
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# API Keys
GEMINI_API_KEY=your-gemini-api-key-here
SPORTS_DB_API_KEY=your-sports-db-api-key-here
SPORTMONKS_API_KEY=your-sportmonks-api-key-here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google Cloud TTS
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Start the application

**Backend (Terminal 1):**
```bash
cd backend
npm start
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🏗️ Project Structure

```
Sports-website/
├── backend/
│   ├── middleware/          # Authentication & error handling
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # External services
│   ├── uploads/            # File uploads
│   └── server.js           # Main server file
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── index.html          # Main HTML file
└── README.md
```

## 🔧 Configuration

### Environment Variables
The application requires several environment variables. Copy `.env.example` to `.env` and configure:

- **Database**: MongoDB connection string
- **Authentication**: JWT secret and expiration
- **APIs**: Sports data and AI service keys
- **Email**: SMTP configuration for notifications
- **Google Cloud**: TTS service configuration

### API Keys Required
1. **Gemini API**: For AI-powered content
2. **Sports DB API**: For sports data
3. **SportMonks API**: For additional sports data
4. **Google Cloud**: For text-to-speech service

## 🎮 Usage

### For Users
1. **Register/Login**: Create an account or sign in
2. **Browse News**: View personalized sports news
3. **Live Scores**: Check real-time match scores
4. **Fantasy**: Get AI predictions for fantasy sports
5. **Calendar**: View upcoming matches and events
6. **Chat**: Join live match discussions

### For Developers
1. **API Endpoints**: RESTful API with comprehensive endpoints
2. **Real-time Updates**: Socket.io for live features
3. **Authentication**: JWT-based secure authentication
4. **File Uploads**: Support for audio and media files

## 🛠️ Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm start` - Start server
- `npm run dev` - Start with nodemon (development)

### Code Structure
- **Components**: Modular React components
- **Services**: API integration and external services
- **Middleware**: Authentication and error handling
- **Models**: Database schema definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Sports data providers for API access
- Google Cloud for TTS services
- Open source community for tools and libraries
- Contributors and testers

## 📞 Support

For support, email [your-email@example.com] or create an issue in the GitHub repository.

---

Built with ❤️ by [CreatesRahul-Lab](https://github.com/CreatesRahul-Lab)
