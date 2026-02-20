import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap, Target, Award, Globe, Users, TrendingUp, Lock, Unlock, Radio } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  category: 'speaking' | 'vocabulary' | 'pronunciation' | 'streak' | 'cultural';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Level {
  id: number;
  name: string;
  description: string;
  requiredXP: number;
  rewards: string[];
  color: string;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  participants: number;
  endTime: Date;
  prize: string;
  category: 'vocabulary' | 'speaking' | 'pronunciation';
}

const GamificationSystem: React.FC = () => {
  const [currentXP, setCurrentXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [globalRank, setGlobalRank] = useState(1247);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_word',
      name: 'First Steps',
      description: 'Learn your first 10 words',
      icon: <Star className="w-6 h-6" />,
      unlocked: true,
      progress: 10,
      maxProgress: 10,
      category: 'vocabulary',
      rarity: 'common'
    },
    {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: 'Practice for 7 days in a row',
      icon: <Zap className="w-6 h-6" />,
      unlocked: true,
      progress: 7,
      maxProgress: 7,
      category: 'streak',
      rarity: 'common'
    },
    {
      id: 'pronunciation_master',
      name: 'Pronunciation Master',
      description: 'Achieve 90% pronunciation accuracy',
      icon: <Target className="w-6 h-6" />,
      unlocked: false,
      progress: 75,
      maxProgress: 90,
      category: 'pronunciation',
      rarity: 'rare'
    },
    {
      id: 'vocabulary_hero',
      name: 'Vocabulary Hero',
      description: 'Learn 500 words',
      icon: <Trophy className="w-6 h-6" />,
      unlocked: false,
      progress: 127,
      maxProgress: 500,
      category: 'vocabulary',
      rarity: 'epic'
    },
    {
      id: 'cultural_explorer',
      name: 'Cultural Explorer',
      description: 'Complete 5 virtual tours',
      icon: <Globe className="w-6 h-6" />,
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      category: 'cultural',
      rarity: 'rare'
    },
    {
      id: 'legendary_speaker',
      name: 'Legendary Speaker',
      description: 'Complete 1000 conversations',
      icon: <Award className="w-6 h-6" />,
      unlocked: false,
      progress: 234,
      maxProgress: 1000,
      category: 'speaking',
      rarity: 'legendary'
    },
    {
      id: 'city_navigator',
      name: 'City Navigator',
      description: 'Complete 10 Adventure Radio missions',
      icon: <Radio className="w-6 h-6" />,
      unlocked: false,
      progress: 0,
      maxProgress: 10,
      category: 'cultural',
      rarity: 'rare'
    }
  ]);

  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 'global_vocab_challenge',
      name: 'Global Vocabulary Challenge',
      description: 'Learn the most words this week!',
      participants: 15420,
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      prize: '1000 coins + Legendary Badge',
      category: 'vocabulary'
    },
    {
      id: 'pronunciation_battle',
      name: 'Pronunciation Battle',
      description: 'Best pronunciation accuracy wins!',
      participants: 8750,
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      prize: '500 coins + Epic Avatar Skin',
      category: 'pronunciation'
    }
  ]);

  const levels: Level[] = [
    { id: 1, name: 'Beginner', description: 'Just starting your English journey', requiredXP: 0, rewards: ['Basic Avatar'], color: 'from-green-400 to-green-600' },
    { id: 2, name: 'Elementary', description: 'Building basic vocabulary', requiredXP: 100, rewards: ['New Colors'], color: 'from-blue-400 to-blue-600' },
    { id: 3, name: 'Intermediate', description: 'Forming simple sentences', requiredXP: 250, rewards: ['Voice Recording'], color: 'from-purple-400 to-purple-600' },
    { id: 4, name: 'Advanced', description: 'Complex conversations', requiredXP: 500, rewards: ['Virtual Tours'], color: 'from-orange-400 to-orange-600' },
    { id: 5, name: 'Expert', description: 'Near-native fluency', requiredXP: 1000, rewards: ['Tournament Access'], color: 'from-red-400 to-red-600' },
    { id: 6, name: 'Master', description: 'Native-level proficiency', requiredXP: 2000, rewards: ['Mentor Status'], color: 'from-yellow-400 to-yellow-600' }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎮 English Learning Arena
          </h1>
          <p className="text-xl text-gray-600">
            Compete, Achieve, and Become an English Master!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Progress */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              Your Level
            </h2>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${levels[currentLevel - 1].color}`}>
                <h3 className="text-xl font-bold text-white mb-1">
                  Level {currentLevel}: {levels[currentLevel - 1].name}
                </h3>
                <p className="text-white text-sm opacity-90">
                  {levels[currentLevel - 1].description}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress to Level {currentLevel + 1}</span>
                  <span className="font-medium text-gray-800">
                    {currentXP} / {levels[currentLevel]?.requiredXP || '∞'} XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((currentXP / (levels[currentLevel]?.requiredXP || 1)) * 100, 100)}%`
                    }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800 mb-2">Next Rewards:</h4>
                <div className="space-y-1">
                  {levels[currentLevel]?.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <Unlock className="w-4 h-4 mr-2 text-green-500" />
                      {reward}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Award className="w-6 h-6 mr-2 text-purple-500" />
              Achievements
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-xl border-2 ${getRarityColor(achievement.rarity)} ${achievement.unlocked ? '' : 'opacity-60'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-white' : 'bg-gray-200'
                      }`}>
                      <div className={getRarityTextColor(achievement.rarity)}>
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {achievement.name}
                        </h3>
                        {achievement.unlocked ? (
                          <Unlock className="w-4 h-4 text-green-500" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        {achievement.description}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.progress} / {achievement.maxProgress}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Global Tournaments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-blue-500" />
              Global Tournaments
            </h2>

            <div className="space-y-4">
              {/* Global Ranking */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800">Your Global Rank</h3>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">#{globalRank}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Up 127 positions this week</span>
                </div>
              </div>

              {/* Active Tournaments */}
              <div className="space-y-3">
                {tournaments.map((tournament) => (
                  <motion.div
                    key={tournament.id}
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800">{tournament.name}</h3>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                        {getTimeRemaining(tournament.endTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{tournament.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{tournament.participants.toLocaleString()} participants</span>
                      </div>
                      <div className="text-sm font-medium text-purple-600">
                        🏆 {tournament.prize}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Streak Counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-center text-white"
        >
          <div className="flex items-center justify-center space-x-4">
            <Zap className="w-8 h-8" />
            <div>
              <h2 className="text-3xl font-bold">{streak} Day Streak!</h2>
              <p className="text-orange-100">Keep practicing to maintain your streak</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationSystem;
