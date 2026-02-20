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
  Radio
} from 'lucide-react';
import LinaEnglishTutor from '@/components/EnglishCenter/LinaEnglishTutor';
import AdventureRadio from '@/components/LanguageCenter/AdventureRadio';
import GamificationSystem from '@/components/EnglishCenter/GamificationSystem';
import CulturalImmersion from '@/components/EnglishCenter/CulturalImmersion';
import AdaptiveContent from '@/components/EnglishCenter/AdaptiveContent';
import AnalyticsDashboard from '@/components/EnglishCenter/AnalyticsDashboard';

type TabType = 'tutor' | 'radio' | 'gamification' | 'cultural' | 'content' | 'analytics';

const EnglishCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('tutor');
  const [userStats, setUserStats] = useState({
    level: 3,
    streak: 7,
    totalWords: 1247,
    globalRank: 2847,
    completedLessons: 89,
    accuracy: 87
  });

  const tabs = [
    {
      id: 'tutor' as TabType,
      name: 'AI Tutor',
      icon: <Mic className="w-5 h-5" />,
      description: 'Practice with Lina AI',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'radio' as TabType,
      name: 'Adventure Radio',
      icon: <Radio className="w-5 h-5" />,
      description: 'A2 Mission Navigator',
      color: 'from-indigo-600 to-blue-700'
    },
    {
      id: 'gamification' as TabType,
      name: 'Achievements',
      icon: <Trophy className="w-5 h-5" />,
      description: 'Track your progress',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'cultural' as TabType,
      name: 'Cultural Tours',
      icon: <Globe className="w-5 h-5" />,
      description: 'Explore the world',
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'content' as TabType,
      name: 'Adaptive Content',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Personalized learning',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'View your progress',
      color: 'from-red-500 to-orange-500'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
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

            {/* User Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-xs text-gray-600">Level</p>
                <p className="text-lg font-bold text-blue-600">{userStats.level}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">Streak</p>
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <p className="text-lg font-bold text-orange-600">{userStats.streak}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">Words</p>
                <p className="text-lg font-bold text-green-600">{userStats.totalWords.toLocaleString()}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">Global Rank</p>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <p className="text-lg font-bold text-purple-600">#{userStats.globalRank.toLocaleString()}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-600">Accuracy</p>
                <p className="text-lg font-bold text-green-600">{userStats.accuracy}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${activeTab === tab.id
                    ? `border-transparent bg-gradient-to-r ${tab.color} text-white`
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                  }`}>
                  {tab.icon}
                </div>
                <div className="text-left">
                  <p className="font-medium">{tab.name}</p>
                  <p className="text-xs opacity-80">{tab.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {renderTabContent()}
        </motion.div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              <Headphones className="w-4 h-4" />
              <span>Quick Practice</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
              <Gamepad2 className="w-4 h-4" />
              <span>Play Games</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
              <Target className="w-4 h-4" />
              <span>Daily Challenge</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors">
              <Star className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
              <Play className="w-4 h-4" />
              <span>Start Lesson</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnglishCenter;
