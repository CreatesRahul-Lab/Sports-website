import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Copy, Link, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShareButtons = ({ url, title, description, className = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || 'Check out this article on Sports News';

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
          '_blank',
          'width=600,height=400'
        );
      }
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
          '_blank',
          'width=600,height=400'
        );
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
          '_blank',
          'width=600,height=400'
        );
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`,
          '_blank'
        );
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => {
        navigator.clipboard.writeText(currentUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: currentUrl
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Share Button */}
      <button
        onClick={handleNativeShare}
        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="p-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2 py-1 mb-1">
                Share this article
              </div>
              {shareOptions.map((option, index) => (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action();
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <div className={`p-2 rounded-lg ${option.color} text-white`}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {option.name === 'Copy Link' && copied ? 'Copied!' : option.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ShareButtons;
