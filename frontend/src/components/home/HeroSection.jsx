import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Clock, Eye, Heart, Share2, ChevronRight } from 'lucide-react';

const HeroSection = ({ featuredArticles = [] }) => {
  const mainArticle = featuredArticles[0];
  const sideArticles = featuredArticles.slice(1, 4);

  if (!mainArticle) {
    return (
      <section className="relative bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to Sports News
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Your ultimate destination for live scores, news, and fantasy predictions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/live-scores"
                className="btn btn-secondary btn-lg"
              >
                View Live Scores
              </Link>
              <Link
                to="/fantasy"
                className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600"
              >
                Fantasy Predictions
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Featured Article */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Link to={`/articles/${mainArticle.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={mainArticle.featuredImage?.url || '/api/placeholder/800/400'}
                  alt={mainArticle.title}
                  className="w-full h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Play Button for Video Articles */}
                {mainArticle.hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Article Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                      {mainArticle.sport.charAt(0).toUpperCase() + mainArticle.sport.slice(1)}
                    </span>
                    <span className="text-sm opacity-90">
                      {mainArticle.readTime} min read
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
                    {mainArticle.title}
                  </h1>
                  <p className="text-gray-200 mb-4 line-clamp-2">
                    {mainArticle.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{mainArticle.views?.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{mainArticle.likes?.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Share2 className="w-4 h-4" />
                        <span>{mainArticle.shares?.toLocaleString()}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(mainArticle.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Side Articles */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              More Headlines
            </h2>
            {sideArticles.map((article, index) => (
              <motion.article
                key={article._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Link to={`/articles/${article.slug}`} className="block">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={article.featuredImage?.url || '/api/placeholder/120/80'}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {article.sport.charAt(0).toUpperCase() + article.sport.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {article.readTime} min read
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {article.title}
                      </h3>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views?.toLocaleString()}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
            
            {/* View More Button */}
            <Link
              to="/articles"
              className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
            >
              <span className="text-gray-600 dark:text-gray-400 group-hover:text-primary-600">
                View More Articles
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
