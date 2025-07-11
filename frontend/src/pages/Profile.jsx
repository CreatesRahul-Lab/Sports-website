import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Heart,
  Bookmark,
  Eye,
  MessageCircle,
  Settings,
  Bell,
  Shield,
  Camera,
  Edit3,
  Save,
  X,
  Trophy,
  Star,
  Award,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user profile data
  const { data: profileData, isLoading, error } = useQuery(
    ['profile', user?.id],
    async () => {
      const response = await api.get(`/users/profile/${user.id}`);
      return response.data;
    },
    {
      enabled: !!user,
      onSuccess: (data) => {
        setFormData(data.user);
      }
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (updateData) => {
      const response = await api.put('/users/profile', updateData);
      return response.data;
    },
    {
      onSuccess: (data) => {
        updateUser(data.user);
        queryClient.invalidateQueries(['profile', user?.id]);
        setIsEditing(false);
      }
    }
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'activity', label: 'Activity', icon: TrendingUp },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancelEdit = () => {
    setFormData(profileData?.user || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <ErrorMessage 
          message="Failed to load profile data" 
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Profile - {user.username}</title>
        <meta name="description" content={`${user.username}'s profile page`} />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-8 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 p-2">
                  {profileData?.user?.avatar ? (
                    <img
                      src={profileData.user.avatar}
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="pt-20 flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.displayName || ''}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-primary-500"
                      />
                    ) : (
                      profileData?.user?.displayName || user.username
                    )}
                  </h1>
                  {profileData?.user?.verified && (
                    <Award className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  @{user.username}
                </p>
                
                {isEditing ? (
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                    {profileData?.user?.bio || 'No bio available'}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center space-x-6 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profileData?.stats?.totalArticlesRead || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Articles Read</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profileData?.stats?.totalLikes || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Likes Given</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profileData?.stats?.totalComments || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profileData?.stats?.joinedDaysAgo || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Days Active</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-8 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <OverviewTab data={profileData} isEditing={isEditing} formData={formData} onInputChange={handleInputChange} />
            )}
            {activeTab === 'activity' && (
              <ActivityTab data={profileData?.activity} />
            )}
            {activeTab === 'preferences' && (
              <PreferencesTab data={profileData?.preferences} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab data={profileData?.settings} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Favorite Sports */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Favorite Sports
              </h3>
              <div className="flex flex-wrap gap-2">
                {profileData?.user?.favoriteSports?.map((sport, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 rounded-full text-sm font-medium"
                  >
                    {sport}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Achievements
              </h3>
              <div className="space-y-3">
                {profileData?.achievements?.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {achievement.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {profileData?.recentActivity?.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {activity.action}
                    </span>
                    <span className="text-gray-500 dark:text-gray-500 ml-2">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OverviewTab = ({ data, isEditing, formData, onInputChange }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white">{data?.user?.email}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => onInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white">{data?.user?.phone || 'Not provided'}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => onInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white">{data?.user?.location || 'Not provided'}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Member Since
          </label>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white">
              {new Date(data?.user?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ActivityTab = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Reading Activity
      </h3>
      <div className="space-y-4">
        {data?.recentArticles?.map((article, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Eye className="w-5 h-5 text-blue-500" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">{article.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Read on {new Date(article.readAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PreferencesTab = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Notification Preferences
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Breaking News</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about breaking sports news</p>
          </div>
          <input type="checkbox" className="toggle" defaultChecked={data?.notifications?.breakingNews} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Live Scores</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Live score updates for your favorite teams</p>
          </div>
          <input type="checkbox" className="toggle" defaultChecked={data?.notifications?.liveScores} />
        </div>
      </div>
    </div>
  </div>
);

const SettingsTab = ({ data }) => (
  <div className="space-y-6">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Account Settings
      </h3>
      <div className="space-y-4">
        <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Change Password</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
            </div>
          </div>
        </button>
        <button className="w-full text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-yellow-500" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Notification Settings</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your notification preferences</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
);

export default Profile;
