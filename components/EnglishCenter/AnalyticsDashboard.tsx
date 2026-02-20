import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Volume2, 
  Globe, 
  Award, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  BookOpen,
  Mic
} from 'lucide-react';

interface AnalyticsData {
  wordsLearned: number;
  conversationsCompleted: number;
  pronunciationScore: number;
  studyTime: number;
  activeDays: number;
  accuracy: number;
  vocabularyDiversity: number;
  culturalActivities: number;
}

interface WeeklyProgress {
  day: string;
  wordsLearned: number;
  conversations: number;
  pronunciationScore: number;
  studyTime: number;
}

interface VocabularyCategory {
  category: string;
  words: number;
  mastered: number;
  inProgress: number;
  difficulty: number;
}

interface GlobalComparison {
  metric: string;
  userValue: number;
  globalAverage: number;
  percentile: number;
  rank: number;
  totalUsers: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    wordsLearned: 1247,
    conversationsCompleted: 89,
    pronunciationScore: 87,
    studyTime: 1240, // minutes
    activeDays: 23,
    accuracy: 85,
    vocabularyDiversity: 72,
    culturalActivities: 15
  });

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([
    { day: 'Mon', wordsLearned: 45, conversations: 3, pronunciationScore: 85, studyTime: 120 },
    { day: 'Tue', wordsLearned: 38, conversations: 2, pronunciationScore: 88, studyTime: 95 },
    { day: 'Wed', wordsLearned: 52, conversations: 4, pronunciationScore: 86, studyTime: 140 },
    { day: 'Thu', wordsLearned: 41, conversations: 3, pronunciationScore: 89, studyTime: 110 },
    { day: 'Fri', wordsLearned: 48, conversations: 5, pronunciationScore: 87, studyTime: 125 },
    { day: 'Sat', wordsLearned: 35, conversations: 2, pronunciationScore: 85, studyTime: 80 },
    { day: 'Sun', wordsLearned: 28, conversations: 1, pronunciationScore: 84, studyTime: 60 }
  ]);

  const [vocabularyCategories, setVocabularyCategories] = useState<VocabularyCategory[]>([
    { category: 'Everyday Life', words: 234, mastered: 189, inProgress: 45, difficulty: 2 },
    { category: 'School & Education', words: 187, mastered: 134, inProgress: 53, difficulty: 3 },
    { category: 'Entertainment', words: 156, mastered: 98, inProgress: 58, difficulty: 2 },
    { category: 'Sports & Hobbies', words: 203, mastered: 145, inProgress: 58, difficulty: 4 },
    { category: 'Technology', words: 98, mastered: 45, inProgress: 53, difficulty: 5 },
    { category: 'Culture & Travel', words: 145, mastered: 87, inProgress: 58, difficulty: 4 }
  ]);

  const [globalComparisons, setGlobalComparisons] = useState<GlobalComparison[]>([
    { metric: 'Words Learned', userValue: 1247, globalAverage: 890, percentile: 78, rank: 2847, totalUsers: 15420 },
    { metric: 'Pronunciation', userValue: 87, globalAverage: 72, percentile: 85, rank: 1923, totalUsers: 15420 },
    { metric: 'Study Time', userValue: 1240, globalAverage: 890, percentile: 82, rank: 2156, totalUsers: 15420 },
    { metric: 'Accuracy', userValue: 85, globalAverage: 68, percentile: 88, rank: 1654, totalUsers: 15420 }
  ]);

  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Calculate insights
  const calculateInsights = () => {
    const totalWords = weeklyProgress.reduce((sum, day) => sum + day.wordsLearned, 0);
    const avgDaily = Math.round(totalWords / 7);
    const bestDay = weeklyProgress.reduce((best, day) => 
      day.wordsLearned > best.wordsLearned ? day : best
    );
    
    return {
      totalWords,
      avgDaily,
      bestDay: bestDay.day,
      improvement: bestDay.wordsLearned > avgDaily ? 'above average' : 'needs improvement'
    };
  };

  const insights = calculateInsights();

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 90) return 'text-green-600';
    if (percentile >= 70) return 'text-blue-600';
    if (percentile >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 mr-3 text-blue-500" />
            Learning Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Track progress, identify patterns, and optimize learning
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-xl shadow-sm p-1 inline-flex">
            {['week', 'month', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range as any)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Key Performance Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Words Learned</span>
                  <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{analyticsData.wordsLearned.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12% this week</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Conversations</span>
                  <Users className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{analyticsData.conversationsCompleted}</p>
                <p className="text-xs text-green-600">+8 this week</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Pronunciation</span>
                  <Mic className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{analyticsData.pronunciationScore}%</p>
                <p className="text-xs text-green-600">+3% this week</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Study Time</span>
                  <Clock className="w-4 h-4 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-orange-600">{formatTime(analyticsData.studyTime)}</p>
                <p className="text-xs text-green-600">+45min this week</p>
              </div>
            </div>
            
            {/* Additional Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{analyticsData.activeDays}</p>
                <p className="text-xs text-gray-600">Active Days</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{analyticsData.accuracy}%</p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-800">{analyticsData.vocabularyDiversity}%</p>
                <p className="text-xs text-gray-600">Vocab Diversity</p>
              </div>
            </div>
          </motion.div>

          {/* Weekly Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-500" />
              Weekly Progress
            </h2>
            
            <div className="space-y-3">
              {weeklyProgress.map((day, index) => (
                <div key={day.day} className="flex items-center space-x-3">
                  <div className="w-12 text-center">
                    <p className="text-xs font-medium text-gray-600">{day.day}</p>
                  </div>
                  
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Words</span>
                        <span className="font-medium">{day.wordsLearned}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.wordsLearned / 60) * 100}%` }}
                          transition={{ delay: index * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Conversations</span>
                        <span className="font-medium">{day.conversations}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.conversations / 10) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-16 text-center">
                    <div className="text-xs text-gray-600 mb-1">Pronunciation</div>
                    <div className={`text-lg font-bold ${
                      day.pronunciationScore >= 90 ? 'text-green-600' :
                      day.pronunciationScore >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {day.pronunciationScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Weekly Insights */}
            <div className="mt-4 p-3 bg-blue-50 rounded-xl">
              <h3 className="font-bold text-blue-800 mb-2">Weekly Insights</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Total Words:</span>
                  <span className="font-medium text-blue-800">{insights.totalWords}</span>
                </div>
                <div>
                  <span className="text-gray-600">Daily Average:</span>
                  <span className="font-medium text-blue-800">{insights.avgDaily}</span>
                </div>
                <div>
                  <span className="text-gray-600">Best Day:</span>
                  <span className="font-medium text-blue-800">{insights.bestDay}</span>
                </div>
                <div>
                  <span className="text-gray-600">Trend:</span>
                  <span className={`font-medium ${
                    insights.improvement === 'above average' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {insights.improvement}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Vocabulary Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-orange-500" />
              Vocabulary by Category
            </h2>
            
            <div className="space-y-3">
              {vocabularyCategories.map((category, index) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{category.category}</h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        Level {category.difficulty}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        {category.words} words
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Mastered</span>
                        <span className="font-medium text-green-600">{category.mastered}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(category.mastered / category.words) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>In Progress</span>
                        <span className="font-medium text-yellow-600">{category.inProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className="bg-yellow-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(category.inProgress / category.words) * 100}%` }}
                          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Global Rankings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-blue-500" />
              Global Rankings
            </h2>
            
            <div className="space-y-3">
              {globalComparisons.map((comparison, index) => (
                <motion.div
                  key={comparison.metric}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800">{comparison.metric}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getPercentileColor(comparison.percentile)}`}>
                        Top {100 - comparison.percentile}%
                      </span>
                      <span className="text-xs text-gray-600">
                        #{comparison.rank.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Your Score</p>
                      <p className="text-lg font-bold text-blue-600">{comparison.userValue}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Global Avg</p>
                      <p className="text-lg font-medium text-gray-700">{comparison.globalAverage}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Percentile</p>
                      <p className={`text-lg font-bold ${getPercentileColor(comparison.percentile)}`}>
                        {comparison.percentile}th
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Total Users</span>
                      <span className="font-medium">{comparison.totalUsers.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center">
                <Target className="w-6 h-6 mr-2" />
                AI Recommendations
              </h3>
              <div className="space-y-1">
                <p className="text-purple-100">• Focus on pronunciation practice - 15min daily recommended</p>
                <p className="text-purple-100">• Try cultural immersion activities on weekends</p>
                <p className="text-purple-100">• Your best learning time: 2-4 PM</p>
              </div>
            </div>
            
            <div className="text-right">
              <button className="px-4 py-2 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium">
                View Detailed Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
