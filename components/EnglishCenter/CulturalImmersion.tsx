import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// Lucide icons replaced with emojis for a more native look

interface CulturalLocation {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  activities: string[];
  culturalFacts: string[];
  nativeSpeaker: {
    name: string;
    age: number;
    interests: string[];
    avatar: string;
  };
}

interface CulturalEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  traditions: string[];
  vocabulary: string[];
  activities: string[];
}

const CulturalImmersion: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>('london');
  const [isInVirtualTour, setIsInVirtualTour] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  const locations: CulturalLocation[] = [
    {
      id: 'london',
      name: 'London, England',
      country: 'United Kingdom',
      description: 'Experience the heart of British culture and history',
      imageUrl: '/images/london-360.jpg',
      activities: ['Visit Big Ben', 'Explore Tower of London', 'Ride London Eye', 'Tour British Museum'],
      culturalFacts: [
        'London has over 170 museums',
        'The Tower of London is 900 years old',
        'Big Ben\'s real name is Elizabeth Tower'
      ],
      nativeSpeaker: {
        name: 'Emma',
        age: 12,
        interests: ['⚽ football', '🎵 music', '🎨 art'],
        avatar: '/avatars/emma.jpg'
      }
    },
    {
      id: 'newyork',
      name: 'New York City, USA',
      country: 'United States',
      description: 'Discover the melting pot of American culture',
      imageUrl: '/images/newyork-360.jpg',
      activities: ['Times Square', 'Central Park', 'Statue of Liberty', 'Brooklyn Bridge'],
      culturalFacts: [
        'NYC has 800+ languages spoken',
        'Central Park is larger than Monaco',
        'Times Square is called "The Crossroads of the World"'
      ],
      nativeSpeaker: {
        name: 'Jake',
        age: 11,
        interests: ['🏀 basketball', '🎮 video games', '🎬 movies'],
        avatar: '/avatars/jake.jpg'
      }
    },
    {
      id: 'sydney',
      name: 'Sydney, Australia',
      country: 'Australia',
      description: 'Explore Australian culture and wildlife',
      imageUrl: '/images/sydney-360.jpg',
      activities: ['Sydney Opera House', 'Harbour Bridge', 'Bondi Beach', 'Royal Botanic Gardens'],
      culturalFacts: [
        'Sydney Opera House took 14 years to build',
        'Australia has more sheep than people',
        'Sydney has over 100 beaches'
      ],
      nativeSpeaker: {
        name: 'Olivia',
        age: 13,
        interests: ['🏄‍♂️ surfing', '🐼 animals', '🍳 cooking'],
        avatar: '/avatars/olivia.jpg'
      }
    }
  ];

  const culturalEvents: CulturalEvent[] = [
    {
      id: 'halloween',
      name: 'Halloween',
      date: 'October 31',
      description: 'Learn about Halloween traditions and vocabulary',
      traditions: [
        'Trick-or-treating',
        'Jack-o\'-lanterns',
        'Costume parties',
        'Haunted houses'
      ],
      vocabulary: ['👻 spooky', '🧛 costume', '🍬 candy', '🎃 pumpkin', '🧙‍♀️ witch', '💀 ghost'],
      activities: ['🎃 Carve pumpkins', '🏚️ Decorate house', '🍬 Trick-or-treat simulation', '🎉 Halloween party']
    },
    {
      id: 'thanksgiving',
      name: 'Thanksgiving',
      date: 'Fourth Thursday of November',
      description: 'Experience American Thanksgiving traditions',
      traditions: [
        'Family dinner',
        'Turkey feast',
        'Football games',
        'Black Friday shopping'
      ],
      vocabulary: ['🙏 grateful', '🍖 feast', '🌾 harvest', '👨‍👩-👧‍👦 family', '✨ tradition', '🙌 blessings'],
      activities: ['🍗 Cook virtual turkey', '🍽️ Family dinner roleplay', '💖 Gratitude sharing', '🏈 Football vocabulary']
    },
    {
      id: 'christmas',
      name: 'Christmas',
      date: 'December 25',
      description: 'Learn Christmas traditions around the world',
      traditions: [
        'Christmas tree',
        'Gift exchange',
        'Caroling',
        'Santa Claus'
      ],
      vocabulary: ['🎉 celebration', '🎄 decorations', '🎁 presents', '😊 joy', '✨ tradition', '🤝 giving'],
      activities: ['🎄 Decorate tree', '🎁 Gift exchange', '🎶 Carol singing', '🎅 Christmas vocabulary']
    }
  ];

  const currentLocation = locations.find(loc => loc.id === selectedLocation) || locations[0];
  const currentEvent = culturalEvents[0]; // Current/next event

  const startVirtualTour = (activity: string) => {
    setCurrentActivity(activity);
    setIsInVirtualTour(true);

    // Add to conversation history
    const newEntry = `Started virtual tour: ${activity} in ${currentLocation.name}`;
    setConversationHistory(prev => [...prev, newEntry]);
  };

  const exitVirtualTour = () => {
    setIsInVirtualTour(false);
    setCurrentActivity('');
  };

  const simulateConversation = (message: string) => {
    setConversationHistory(prev => [...prev, `You: ${message}`]);

    // Simulate native speaker response
    setTimeout(() => {
      const responses = [
        `That's great! In ${currentLocation.name}, we love to ${currentLocation.nativeSpeaker.interests[0]} too!`,
        `Wow! Your English is getting really good!`,
        `In my country, ${currentLocation.country}, we say that differently!`,
        `Let me teach you something about ${currentLocation.name}!`
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      setConversationHistory(prev => [...prev, `${currentLocation.nativeSpeaker.name}: ${response}`]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🌍</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Cultural Immersion</h1>
              <p className="text-sm text-gray-600">Explore the world through English</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              <span className="mr-1">📍</span>
              {currentLocation.name}
            </div>
            <div className="text-sm text-gray-600">
              <span className="mr-1">📅</span>
              {currentEvent.name}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Virtual Tour Area */}
        <div className="flex-1 relative">
          {isInVirtualTour ? (
            <div className="h-full relative">
              {/* 360 View Simulation */}
              <div className="h-full bg-gradient-to-br from-blue-200 to-green-200 relative overflow-hidden">
                <img
                  src={currentLocation.imageUrl}
                  alt={currentLocation.name}
                  className="w-full h-full object-cover"
                />

                {/* Activity Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="bg-white rounded-2xl p-6 max-w-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      🌍 {currentActivity}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Exploring {currentActivity} in {currentLocation.name}...
                    </p>

                    {/* Interactive Elements */}
                    <div className="space-y-4">
                      <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                        <span className="mr-2">📸</span>
                        Take Photo
                      </button>

                      <button className="w-full px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
                        <span className="mr-2">🎶</span>
                        Listen to Guide
                      </button>

                      <button
                        onClick={exitVirtualTour}
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                      >
                        Exit Tour
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="absolute top-4 left-4 bg-white rounded-xl p-3 max-w-xs">
                  <h4 className="font-bold text-gray-800 mb-2">{currentLocation.name}</h4>
                  <p className="text-sm text-gray-600">{currentLocation.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Choose Your Destination</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer ${selectedLocation === location.id ? 'ring-4 ring-blue-500' : ''
                        }`}
                    >
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 relative">
                        <img
                          src={location.imageUrl}
                          alt={location.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-bold text-lg">{location.name}</h3>
                          <p className="text-white text-sm opacity-90">{location.country}</p>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-gray-600 text-sm mb-3">{location.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-2">👥</span>
                            <span>Meet {location.nativeSpeaker.name}, {location.nativeSpeaker.age}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {location.nativeSpeaker.interests.map((interest, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
                          <span className="mr-2">▶️</span>
                          Start Tour
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Cultural Facts */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    <span className="mr-2">⭐</span>
                    Cultural Facts about {currentLocation.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentLocation.culturalFacts.map((fact, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-blue-50 rounded-xl p-4"
                      >
                        <p className="text-gray-700 text-sm">{fact}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel - Native Speaker Chat */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Native Speaker Profile */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={currentLocation.nativeSpeaker.avatar}
                alt={currentLocation.nativeSpeaker.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-bold text-gray-800">{currentLocation.nativeSpeaker.name}</h3>
                <p className="text-sm text-gray-600">Native English Speaker</p>
                <p className="text-xs text-blue-600">From {currentLocation.name}</p>
              </div>
            </div>
          </div>

          {/* Vocabulary & Activities - NEW SECTION */}
          <div className="p-4 border-b border-gray-100 bg-blue-50/30">
            <div className="mb-4">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>📚</span> New Vocabulary
              </h4>
              <div className="flex flex-wrap gap-1">
                {currentEvent.vocabulary.map((word, i) => (
                  <span key={i} className="px-2 py-1 bg-white border border-blue-100 text-blue-700 rounded-lg text-[10px] font-bold shadow-sm">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-green-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span>🎯</span> Mission Activities
              </h4>
              <div className="space-y-1">
                {currentEvent.activities.map((activity, i) => (
                  <div
                    key={i}
                    onClick={() => startVirtualTour(activity)}
                    className="p-2 bg-white border border-green-100 text-green-700 rounded-lg text-[10px] font-bold shadow-sm cursor-pointer hover:bg-green-50 transition-colors flex items-center justify-between"
                  >
                    <span>{activity}</span>
                    <span className="text-[8px]">▶️</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-bold text-gray-800 mb-4">Chat with {currentLocation.nativeSpeaker.name}</h3>

              <div className="space-y-3 mb-4">
                {conversationHistory.map((message, index) => (
                  <div key={index} className={`text-sm ${message.startsWith('You:') ? 'text-right' : 'text-left'
                    }`}>
                    <div className={`inline-block px-3 py-2 rounded-xl max-w-xs ${message.startsWith('You:')
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      simulateConversation(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement;
                    if (input.value) {
                      simulateConversation(input.value);
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturalImmersion;
