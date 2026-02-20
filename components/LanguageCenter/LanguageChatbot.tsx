import React from 'react';
import EnglishTutor_mod from '@/pages/EnglishTutor_mod';

const LanguageChatbot: React.FC = () => {
  // Simply render the full English Tutor module which contains the Newsroom, Rachelle, Games, etc.
  return (
    <div className="w-full h-screen bg-slate-900 overflow-y-auto">
      <EnglishTutor_mod />
    </div>
  );
};

export default LanguageChatbot;
