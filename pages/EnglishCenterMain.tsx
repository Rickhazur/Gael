import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Globe,
  Trophy,
  Users,
  BarChart3,
  Play,
  Mic,
  Headphones,
  Gamepad2,
  Target,
  Star,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { Radio } from 'lucide-react';
import LinaEnglishTutor from '@/components/EnglishCenter/LinaEnglishTutor';
import AdventureRadio from '@/components/LanguageCenter/AdventureRadio';
import GamificationSystem from '@/components/EnglishCenter/GamificationSystem';
import CulturalImmersion from '@/components/EnglishCenter/CulturalImmersion';
import AdaptiveContent from '@/components/EnglishCenter/AdaptiveContent';
import AnalyticsDashboard from '@/components/EnglishCenter/AnalyticsDashboard';

type ViewType = 'tutor' | 'radio' | 'gamification' | 'cultural' | 'content' | 'analytics' | 'overview';

const EnglishCenterMain: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [userStats, setUserStats] = useState({
    name: 'Alex',
    age: 10,
    level: 3,
    streak: 7,
    totalWords: 1247,
    globalRank: 2847,
    completedLessons: 89,
    accuracy: 87,
    studyTime: 1240,
    vocabularyDiversity: 72,
    culturalActivities: 15,
    achievements: 12
  });

  const views = [
    {
      id: 'overview' as ViewType,
      name: 'Overview',
      icon: <BarChart3 className="w-6 h-6" />,
      description: 'Dashboard with all features',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'tutor' as ViewType,
      name: 'AI Tutor',
      icon: <Mic className="w-6 h-6" />,
      description: 'Practice with Lina AI',
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'radio' as ViewType,
      name: 'Adventure Radio',
      icon: <Radio className="w-6 h-6" />,
      description: 'Learn A2 by solving missions',
      color: 'from-indigo-600 to-blue-800'
    },
    {
      id: 'gamification' as ViewType,
      name: 'Achievements',
      icon: <Trophy className="w-6 h-6" />,
      description: 'Track your progress',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'cultural' as ViewType,
      name: 'Cultural Tours',
      icon: <Globe className="w-6 h-6" />,
      description: 'Explore the world',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'content' as ViewType,
      name: 'Adaptive Content',
      icon: <BookOpen className="w-6 h-6" />,
      description: 'Personalized learning',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analytics' as ViewType,
      name: 'Analytics',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'View your progress',
      color: 'from-red-500 to-orange-500'
    }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white text-center"
            >
              <h1 className="text-4xl font-bold mb-4">
                🌍 Welcome to English Center
              </h1>
              <p className="text-xl mb-6">
                The World's Most Advanced English Learning Platform
              </p>
              <p className="text-lg opacity-90">
                Personalized AI tutoring • Gamification • Cultural immersion • Adaptive content
              </p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <Users className="w-8 h-8 mx-auto mb-3 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-800">{userStats.name}</h3>
                <p className="text-sm text-gray-600">Level {userStats.level}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <div className="w-8 h-8 mx-auto mb-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">{userStats.streak}</h3>
                <p className="text-sm text-gray-600">Day Streak</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <BookOpen className="w-8 h-8 mx-auto mb-3 text-green-500" />
                <h3 className="text-lg font-bold text-gray-800">{userStats.totalWords.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">Words Learned</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6 text-center"
              >
                <Award className="w-8 h-8 mx-auto mb-3 text-purple-500" />
                <h3 className="text-lg font-bold text-gray-800">#{userStats.globalRank.toLocaleString()}</h3>
                <p className="text-sm text-gray-600">Global Rank</p>
              </motion.div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {views.slice(1).map((view, index) => (
                <motion.div
                  key={view.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setCurrentView(view.id as ViewType)}
                  className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${view.color} rounded-full flex items-center justify-center text-white`}>
                    {view.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{view.name}</h3>
                  <p className="text-gray-600">{view.description}</p>
                  <div className="mt-4 flex items-center text-blue-600 font-medium">
                    <span>Explore {view.name}</span>
                    <Play className="w-4 h-4 ml-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'tutor':
        return <LinaEnglishTutor />;
      case 'radio':
        return <AdventureRadio />;
      case 'gamification':
        return <GamificationSystem />;
      case 'cultural':
        return <CulturalImmersion />;
      case 'content':
        return <AdaptiveContent />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <LinaEnglishTutor />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">EC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">English Center</h1>
                <p className="text-sm text-gray-600">The World's Most Advanced English Learning Platform</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-1">
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id as ViewType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentView === view.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {view.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderCurrentView()}
        </motion.div>
      </div>
    </div>
  );
};

export default EnglishCenterMain;
