import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, TrendingUp, BookOpen, Headphones, Gamepad2, Music, Trophy } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'article' | 'game' | 'podcast' | 'exercise';
  difficulty: number; // 1-12
  category: string;
  duration: string;
  description: string;
  thumbnail: string;
  engagement: number;
  completed: boolean;
  personalized: boolean;
}

interface UserInterest {
  id: string;
  name: string;
  strength: number; // 0-100
  lastAccessed: Date;
  contentGenerated: number;
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  difficulty: number;
  topics: string[];
  progress: number;
  content: ContentItem[];
}

const AdaptiveContent: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(3);
  const [userInterests, setUserInterests] = useState<UserInterest[]>([
    { id: 'games', name: 'Video Games', strength: 85, lastAccessed: new Date(), contentGenerated: 12 },
    { id: 'music', name: 'Music', strength: 70, lastAccessed: new Date(Date.now() - 86400000), contentGenerated: 8 },
    { id: 'sports', name: 'Sports', strength: 60, lastAccessed: new Date(Date.now() - 172800000), contentGenerated: 5 },
    { id: 'movies', name: 'Movies', strength: 90, lastAccessed: new Date(Date.now() - 3600000), contentGenerated: 15 },
    { id: 'animals', name: 'Animals', strength: 75, lastAccessed: new Date(), contentGenerated: 10 }
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [adaptiveContent, setAdaptiveContent] = useState<ContentItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  // Generate personalized content based on user interests and level
  const generatePersonalizedContent = async () => {
    setIsGenerating(true);
    
    // Simulate AI content generation
    const generatedContent: ContentItem[] = [];
    
    // Generate content for each strong interest
    userInterests
      .filter(interest => interest.strength > 70)
      .forEach(interest => {
        const contentTypes = ['video', 'article', 'game', 'podcast', 'exercise'];
        const categories = ['vocabulary', 'grammar', 'conversation', 'pronunciation', 'culture'];
        
        for (let i = 0; i < 3; i++) {
          const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
          const category = categories[Math.floor(Math.random() * categories.length)];
          
          generatedContent.push({
            id: `${interest.id}_${contentType}_${i}`,
            title: generateContentTitle(interest.name, contentType, category),
            type: contentType as any,
            difficulty: currentLevel,
            category: `${interest.name} - ${category}`,
            duration: generateContentDuration(contentType),
            description: generateContentDescription(interest.name, contentType, category),
            thumbnail: `/content/${interest.name}_${contentType}_${i}.jpg`,
            engagement: Math.floor(Math.random() * 100) + 20,
            completed: false,
            personalized: true
          });
        }
      });
    
    // Add some general content
    for (let i = 0; i < 5; i++) {
      const contentTypes = ['video', 'article', 'game', 'podcast', 'exercise'];
      const categories = ['vocabulary', 'grammar', 'conversation', 'pronunciation', 'culture'];
      
      generatedContent.push({
        id: `general_${contentTypes[i % contentTypes.length]}`,
        title: generateContentTitle('General Learning', contentTypes[i % contentTypes.length], categories[i % categories.length]),
        type: contentTypes[i % contentTypes.length] as any,
        difficulty: currentLevel,
        category: `General - ${categories[i % categories.length]}`,
        duration: generateContentDuration(contentTypes[i % contentTypes.length]),
        description: generateContentDescription('General Learning', contentTypes[i % contentTypes.length], categories[i % categories.length]),
        thumbnail: `/content/general_${i}.jpg`,
        engagement: Math.floor(Math.random() * 100) + 20,
        completed: false,
        personalized: false
      });
    }
    
    // Sort by engagement and personalization
    generatedContent.sort((a, b) => {
      if (a.personalized && !b.personalized) return -1;
      if (!a.personalized && b.personalized) return 1;
      return b.engagement - a.engagement;
    });
    
    setTimeout(() => {
      setAdaptiveContent(generatedContent);
      setIsGenerating(false);
      
      // Update user interests
      setUserInterests(prev => prev.map(interest => ({
        ...interest,
        contentGenerated: interest.contentGenerated + 3,
        lastAccessed: new Date()
      })));
    }, 2000);
  };

  const generateContentTitle = (interest: string, type: string, category: string): string => {
    const titles = {
      video: `Learn ${category} with ${interest}`,
      article: `${interest} ${category} Guide`,
      game: `${interest} ${category} Challenge`,
      podcast: `Talk about ${interest}`,
      exercise: `Practice ${interest} ${category}`
    };
    return titles[type as keyof typeof titles] || `${interest} Learning`;
  };

  const generateContentDescription = (interest: string, type: string, category: string): string => {
    return `Personalized ${type} content about ${interest} focusing on ${category}. Adapted for your learning level and interests.`;
  };

  const generateContentDuration = (type: string): string => {
    const durations = {
      video: `${Math.floor(Math.random() * 10) + 5} min`,
      article: `${Math.floor(Math.random() * 5) + 3} min read`,
      game: `${Math.floor(Math.random() * 15) + 10} min`,
      podcast: `${Math.floor(Math.random() * 20) + 10} min`,
      exercise: `${Math.floor(Math.random() * 10) + 5} min`
    };
    return durations[type as keyof typeof durations] || '5 min';
  };

  // Generate learning paths
  useEffect(() => {
    const paths: LearningPath[] = [
      {
        id: 'conversation_master',
        name: 'Conversation Master',
        description: 'Master everyday conversations in English',
        estimatedTime: '2 weeks',
        difficulty: currentLevel,
        topics: ['Greetings', 'Family', 'School', 'Friends', 'Hobbies'],
        progress: 65,
        content: []
      },
      {
        id: 'vocabulary_builder',
        name: 'Vocabulary Builder',
        description: 'Expand your vocabulary with personalized words',
        estimatedTime: '4 weeks',
        difficulty: currentLevel,
        topics: userInterests.map(i => i.name),
        progress: 40,
        content: []
      },
      {
        id: 'pronunciation_perfect',
        name: 'Perfect Pronunciation',
        description: 'Achieve native-like pronunciation',
        estimatedTime: '3 weeks',
        difficulty: currentLevel,
        topics: ['Sounds', 'Rhythm', 'Intonation', 'Practice'],
        progress: 75,
        content: []
      }
    ];
    
    setLearningPaths(paths);
    generatePersonalizedContent();
  }, [currentLevel]);

  const getContentIcon = (type: string) => {
    const icons = {
      video: <Headphones className="w-5 h-5" />,
      article: <BookOpen className="w-5 h-5" />,
      game: <Gamepad2 className="w-5 h-5" />,
      podcast: <Music className="w-5 h-5" />,
      exercise: <Target className="w-5 h-5" />
    };
    return icons[type as keyof typeof icons] || <BookOpen className="w-5 h-5" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      video: 'bg-red-100 text-red-800',
      article: 'bg-blue-100 text-blue-800',
      game: 'bg-green-100 text-green-800',
      podcast: 'bg-purple-100 text-purple-800',
      exercise: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Brain className="w-8 h-8 mr-3 text-purple-500" />
            Adaptive Learning Content
          </h1>
          <p className="text-xl text-gray-600">
            Personalized content that adapts to your interests and learning style
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Interests Analysis */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Your Interests Analysis
            </h2>
            
            <div className="space-y-3">
              {userInterests.map((interest, index) => (
                <motion.div
                  key={interest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{interest.name}</span>
                    <span className={`text-sm font-medium ${
                      interest.strength > 80 ? 'text-green-600' :
                      interest.strength > 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {interest.strength}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${interest.strength}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Content generated: {interest.contentGenerated}</span>
                    <span>Level {currentLevel}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button
              onClick={generatePersonalizedContent}
              disabled={isGenerating}
              className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isGenerating ? 'Generating...' : 'Generate New Content'}
            </button>
          </motion.div>

          {/* Learning Paths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Your Learning Paths
            </h2>
            
            <div className="space-y-3">
              {learningPaths.map((path, index) => (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800">{path.name}</h3>
                    <span className="text-sm text-gray-600">{path.estimatedTime}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{path.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-800">{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${path.progress}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {path.topics.slice(0, 3).map((topic, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {topic}
                      </span>
                    ))}
                    {path.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        +{path.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Adaptive Content Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-1"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
              Personalized Content Feed
            </h2>
            
            {/* Category Filter */}
            <div className="flex space-x-2 mb-4">
              {['all', 'video', 'article', 'game', 'podcast', 'exercise'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Content Grid */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isGenerating ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Generating personalized content...</span>
                  </div>
                </div>
              ) : (
                adaptiveContent
                  .filter(content => selectedCategory === 'all' || content.type === selectedCategory)
                  .map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(content.type)}`}>
                          {getContentIcon(content.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-1">
                              {content.title}
                            </h3>
                            {content.personalized && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                AI Personalized
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {content.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{content.duration}</span>
                            <span>Level {content.difficulty}</span>
                            <span className="flex items-center">
                              <Trophy className="w-3 h-3 mr-1" />
                              {content.engagement}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white text-center"
        >
          <div className="flex items-center justify-center space-x-4">
            <Brain className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold mb-1">AI Learning Insights</h3>
              <p className="text-blue-100">
                Based on your interests, we recommend focusing on {userInterests[0].name} and {userInterests[1].name} content
              </p>
              <p className="text-sm text-blue-200 mt-2">
                Your learning pattern shows peak performance between 2-4 PM
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdaptiveContent;
