import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Play,
  Pause,
  Volume2,
  ArrowLeft,
  Tag,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import AudioPlayer from '../components/audio/AudioPlayer';
import ShareButtons from '../components/share/ShareButtons';
import FanReactionsWidget from '../components/reactions/FanReactionsWidget';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  // Fetch article data
  const { data: article, isLoading, error } = useQuery(
    ['article', id],
    async () => {
      const response = await api.get(`/articles/${id}`);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setLikeCount(data.likes || 0);
        setViewCount(data.views || 0);
        setIsLiked(data.isLiked || false);
      }
    }
  );

  // Fetch related articles
  const { data: relatedArticles } = useQuery(
    ['related-articles', article?.sport, article?.tags],
    async () => {
      if (!article) return [];
      const response = await api.get(`/articles/related/${id}`);
      return response.data.articles || [];
    },
    {
      enabled: !!article
    }
  );

  // Track article view
  useEffect(() => {
    if (article) {
      api.post(`/articles/${id}/view`).catch(console.error);
    }
  }, [article, id]);

  const handleLike = async () => {
    if (!user) {
      // Redirect to login
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/articles/${id}/like`);
      setIsLiked(response.data.isLiked);
      setLikeCount(response.data.likes);
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorMessage 
          message="Article not found" 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>{article.title} - Sports News</title>
        <meta name="description" content={article.summary} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.summary} />
        <meta property="og:image" content={article.image} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          {/* Featured Image */}
          {article.image && (
            <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              {article.trending && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </div>
              )}
            </div>
          )}

          <div className="p-8">
            {/* Article Meta */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{getReadingTime(article.content)} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount.toLocaleString()} views</span>
                </div>
              </div>
              
              {/* Sport Category */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                {article.sport}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>

            {/* Summary */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {article.summary}
            </p>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Audio Player */}
            {article.audioUrl && (
              <div className="mb-8">
                <AudioPlayer 
                  audioUrl={article.audioUrl}
                  title={article.title}
                  duration={article.audioDuration}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isLiked 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likeCount}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span>Comment</span>
                </button>
              </div>

              <ShareButtons 
                url={window.location.href}
                title={article.title}
                description={article.summary}
              />
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-primary-600 dark:prose-a:text-primary-400">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>
        </motion.article>

        {/* Fan Reactions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Fan Reactions
          </h2>
          <FanReactionsWidget articleId={id} />
        </div>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.slice(0, 4).map((relatedArticle, index) => (
                <motion.div
                  key={relatedArticle._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/articles/${relatedArticle._id}`)}
                >
                  {relatedArticle.image && (
                    <img
                      src={relatedArticle.image}
                      alt={relatedArticle.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-primary-600 font-medium">
                        {relatedArticle.sport}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(relatedArticle.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                      {relatedArticle.summary}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;
