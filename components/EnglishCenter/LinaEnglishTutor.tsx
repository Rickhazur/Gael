import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Globe, Trophy, Star, Zap } from 'lucide-react';
import { edgeTTS } from '@/services/edgeTTS';

interface Message {
  id: string;
  role: 'user' | 'lina';
  content: string;
  timestamp: number;
  pronunciation?: {
    score: number;
    feedback: string;
    words: Array<{
      word: string;
      correct: boolean;
      suggestion?: string;
    }>;
  };
}

interface UserProfile {
  name: string;
  age: number;
  level: number;
  interests: string[];
  accent: string;
  streak: number;
  totalWords: number;
  achievements: string[];
}

const LinaEnglishTutor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Student',
    age: 8,
    level: 1,
    interests: ['games', 'music', 'sports'],
    accent: 'spanish',
    streak: 0,
    totalWords: 0,
    achievements: []
  });
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            setInputText(transcript);
            handleSendMessage(transcript, true);
          }
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const analyzePronunciation = async (text: string): Promise<Message['pronunciation']> => {
    // Simulate pronunciation analysis
    const words = text.toLowerCase().split(' ');
    const analyzedWords = words.map(word => ({
      word,
      correct: Math.random() > 0.3, // Simulate accuracy
      suggestion: Math.random() > 0.7 ? `Try: "${word}"` : undefined
    }));

    const score = Math.round((analyzedWords.filter(w => w.correct).length / analyzedWords.length) * 100);
    
    return {
      score,
      feedback: score > 80 ? 'Excellent pronunciation!' : score > 60 ? 'Good pronunciation! Keep practicing.' : 'Let\'s work on pronunciation together.',
      words: analyzedWords
    };
  };

  const generatePersonalizedResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response based on user profile
    const responses = [
      `Great job ${userProfile.name}! I noticed you're interested in ${userProfile.interests[0]}. Let's practice some vocabulary about that!`,
      `That's wonderful! Your pronunciation is getting better. Let's try a more advanced phrase.`,
      `I can see you're making progress! You've learned ${userProfile.totalWords} words so far. Let's add some more!`,
      `Since you like ${userProfile.interests[1]}, how about we talk about that in English?`,
      `Your accent is improving! Let's practice some tricky sounds together.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (text: string, isVoice = false) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      pronunciation: isVoice ? await analyzePronunciation(text) : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsAnalyzing(true);

    // Generate personalized response
    const linaResponse = await generatePersonalizedResponse(text);
    
    // Update user stats
    const newTotalWords = userProfile.totalWords + text.split(' ').length;
    setUserProfile(prev => ({
      ...prev,
      totalWords: newTotalWords,
      streak: prev.streak + 1
    }));

    setTimeout(() => {
      const linaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'lina',
        content: linaResponse,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, linaMessage]);
      setIsAnalyzing(false);
      
      // Speak response
      edgeTTS.speak(linaResponse, 'lina');
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 1500);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startNewConversation = () => {
    const topics = [
      'Tell me about your favorite game',
      'What did you do today?',
      'Let\'s talk about your family',
      'Describe your best friend',
      'What sports do you like to play?'
    ];
    
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    handleSendMessage(randomTopic);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Lina English Tutor</h1>
              <p className="text-sm text-gray-600">Level {currentLevel} • {userProfile.streak} day streak</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">{userProfile.totalWords}</span>
            </div>
            <div className="flex items-center space-x-1 bg-purple-100 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Lv.{currentLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-800 shadow-lg'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {message.pronunciation && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">Pronunciation Score</span>
                          <span className={`text-xs font-bold ${
                            message.pronunciation.score > 80 ? 'text-green-600' :
                            message.pronunciation.score > 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {message.pronunciation.score}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{message.pronunciation.feedback}</p>
                        <div className="flex flex-wrap gap-1">
                          {message.pronunciation.words.map((word, index) => (
                            <span
                              key={index}
                              className={`text-xs px-1 py-0.5 rounded ${
                                word.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {word.word}
                              {word.suggestion && <span className="text-xs text-gray-500"> → {word.suggestion}</span>}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white text-gray-800 shadow-lg px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Lina is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Your Progress</h2>
          
          {/* User Profile */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{userProfile.name}</h3>
                <p className="text-sm text-gray-600">Age {userProfile.age} • Level {userProfile.level}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">🔥 Streak</span>
                <span className="text-sm font-bold text-orange-600">{userProfile.streak} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">📚 Total Words</span>
                <span className="text-sm font-bold text-blue-600">{userProfile.totalWords}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">🎯 Accuracy</span>
                <span className="text-sm font-bold text-green-600">87%</span>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="mb-4">
            <h3 className="font-bold text-gray-800 mb-2">Your Interests</h3>
            <div className="flex flex-wrap gap-2">
              {userProfile.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <button
              onClick={startNewConversation}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm"
            >
              🎲 New Topic
            </button>
            
            <button className="w-full px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium text-sm">
              🎮 Play Games
            </button>
            
            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium text-sm">
              🌍 Virtual Tour
            </button>
            
            <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium text-sm">
              📊 View Progress
            </button>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMessage(inputText);
                }
              }}
              placeholder="Type your message or click the microphone..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={!inputText.trim() || isAnalyzing}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Send
            </button>
            
            <button className="p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          
          {isListening && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>Listening... Speak clearly!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinaEnglishTutor;
