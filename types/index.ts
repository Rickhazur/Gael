
import React from 'react';

export type Language = 'es' | 'en' | 'bilingual';
export type UserLevel = 'primary' | 'bachillerato' | 'admin' | 'KIDS' | 'TEEN';
export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ParentMission {
  id: string;
  title: string;
  description: string;
  reward_coins: number;
  reward_xp: number;
  bonus_coins?: number;
  is_completed: boolean;
  type: string;
}

export interface UserProfile {
  id: string;
  name: string;
  level: UserLevel;
  avatar?: string;
  avatarId?: string; // ID from AVATARS list
  unlockedAccessories: string[]; // List of Accessory IDs
  equippedAccessories: {
    head?: string;
    face?: string;
    torso?: string;
    back?: string;
    pet?: string;
    effect?: string;
  };
  points: number; // For gamification
  mustChangePassword?: boolean;
  plan: PlanType; // New subscription plan field
}

export type PlanType = 'free' | 'standard' | 'premium';

export interface Student {
  id: string;
  uid?: string;
  name: string;
  email: string;
  account_status: 'pending' | 'active' | 'rejected' | 'inactive';
  level: string;
  guardian_phone?: string;
}

export interface PlanLimits {
  dailyVoice: number; // -1 for unlimited
  hasDashboard: boolean;
  hasLegendaryPets: boolean;
  lifetimeQuestions: number; // -1 for unlimited. For free tier, this/is the HARD LOCK.
}

export const PLANS: Record<PlanType, PlanLimits> = {
  free: { dailyVoice: 0, hasDashboard: false, hasLegendaryPets: false, lifetimeQuestions: 5 },
  standard: { dailyVoice: 20, hasDashboard: true, hasLegendaryPets: false, lifetimeQuestions: -1 },
  premium: { dailyVoice: -1, hasDashboard: true, hasLegendaryPets: true, lifetimeQuestions: -1 }
};

export const FREE_TIER_LIMITS = {
  DAILY_AI_QUERIES: 5,
  DAILY_FLASHCARDS: 3,
  ALLOW_DIAGNOSTIC: false,
};

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  SCHEDULE = 'SCHEDULE',
  CURRICULUM = 'CURRICULUM',
  AI_CONSULTANT = 'AI_CONSULTANT',
  METRICS = 'METRICS',
  PROGRESS = 'PROGRESS',
  DIAGNOSTIC = 'DIAGNOSTIC',
  SOCIAL = 'SOCIAL',
  FLASHCARDS = 'FLASHCARDS',
  REWARDS = 'REWARDS',
  SETTINGS = 'SETTINGS',
  REPOSITORY = 'REPOSITORY',
  WHITEBOARD = 'WHITEBOARD',
  TEACHER_REPORT = 'TEACHER_REPORT',
  MATH_TUTOR = 'MATH_TUTOR',
  RESEARCH_CENTER = 'RESEARCH_CENTER',
  BUDDY_LEARN = 'BUDDY_LEARN',
  LAB_DEV = 'LAB_DEV',
  GUARDIANS = 'GUARDIANS',
  PAYMENTS = 'PAYMENTS',
  T_SESSIONS = 'T_SESSIONS',
  STORE = 'STORE',
  ARTS_TUTOR = 'ARTS_TUTOR',
  ARENA = 'ARENA',
  PARENT_DASHBOARD = 'PARENT_DASHBOARD',
  TASK_CONTROL = 'TASK_CONTROL',
  GOOGLE_CLASSROOM = 'GOOGLE_CLASSROOM',
  MOODLE_SYNC = 'MOODLE_SYNC',
  SUBSCRIPTION = 'SUBSCRIPTION',
  NOTEBOOK_LIBRARY = 'NOTEBOOK_LIBRARY',
  MATH_LAB = 'MATH_LAB',
  ACCESSORY_POSITIONER = 'ACCESSORY_POSITIONER',
  LANGUAGE_CENTER = 'LANGUAGE_CENTER',
  SPANISH_TUTOR = 'SPANISH_TUTOR',
  SPARK_CHAT = 'SPARK_CHAT',
  WORD_PROBLEMS = 'WORD_PROBLEMS',
  WORD_PROBLEMS_DEMO = 'WORD_PROBLEMS_DEMO',
  NANO_BANANA_CITY = 'NANO_BANANA_CITY',
  ADVENTURE_RADIO = 'ADVENTURE_RADIO',
  NEON_DINER = 'NEON_DINER',
  CITY_INSPECTOR = 'CITY_INSPECTOR',
  TIME_MACHINE = 'TIME_MACHINE',
  SENTENCE_BUILDER = 'SENTENCE_BUILDER',
  STORY_TELLER = 'STORY_TELLER',
  NOVA_BANK = 'NOVA_BANK'
  // Removed RESEARCH, PRICING, PAYMENTS
}

export interface AppMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  type: 'SUPPORT_TICKET' | 'ADMIN_ALERT' | 'SYSTEM_NOTIFY' | 'ADMIN_REPLY';
  timestamp: string;
  read: boolean;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
  image?: string; // Base64 string for vision tasks
  groundingMetadata?: {
    groundingChunks: GroundingChunk[];
  };
}

export interface ScheduleBlock {
  time: string;
  activity: string;
  type: 'academic' | 'break' | 'skills' | 'wellness';
  description: string;
}

export interface Infraction {
  id: string;
  type: 'ACADEMIC_DISHONESTY' | 'LATENESS' | 'UNPREPARED' | 'DISTRACTION' | 'OFF_TOPIC';
  description: string;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  category: 'avatar' | 'accessory' | 'theme' | 'coupon' | 'real';
  subType?: string; // For accessories: 'head', 'glasses', 'torso', etc.
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  image?: string; // Emoji or URL
  color?: string;
  owned: boolean;
  minLevel?: number;
}

export interface Assignment {
  title: string;
  description: string;
  dueDate: string;
  timestamp: number;
}

// Nueva interfaz para Planes
export interface EducationalPlan {
  id: string;
  name: string;
  description: string;
  allowedViews: string[]; // List of ViewState IDs
}

export const SCHOOL_VALUES = [
  "Autonomía",
  "Excelencia",
  "Curiosidad",
  "Resiliencia",
  "Colaboración",
  "Impacto Social",
  "Felicidad"
];

// --- CURRICULUM INTERFACES (Moved from Curriculum.tsx) ---

export interface AIClassBlueprint {
  hook: string;
  development: string;
  practice: string;
  closure: string;
  differentiation: string;
}

export interface ClassSession {
  id: number;
  title: string;
  duration: string;
  topic: string;
  blueprint: AIClassBlueprint;
  isRemedial?: boolean;
  isEvaluation?: boolean;
  isWrittenExam?: boolean;
  questions?: { id: number; text: string; options: string[] }[];
  isLocked?: boolean;
  score?: number; // 0-100 score for Mastery Learning
}

export interface Module {
  id: number;
  name: string;
  level: string;
  focus: string;
  classes: ClassSession[];
}

export interface SkillTrack {
  id: string;
  name: string;
  overview: string;
  modules: Module[];
}

export interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  tracks: SkillTrack[];
  colorTheme: 'amber' | 'sky' | 'rose' | 'emerald' | 'indigo' | 'fuchsia' | 'teal' | 'violet' | 'kid-blue' | 'kid-pink' | 'kid-yellow' | 'kid-orange' | 'kid-green' | 'kid-purple' | 'kid-navy';
}

// --- PHASE 2: RESEARCH SYSTEM TYPES ---

export interface ResearchSource {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  author?: string;
  url: string;
  domain: string;
  dateAccessed: string;
  datePublished?: string;
  notes?: string;
  highlights: string[];
  screenshots: string[];
  createdAt: string;
}

export interface ResearchSession {
  id: string;
  userId: string;
  projectId?: string;
  startTime: string;
  endTime?: string;
  visitedUrls: {
    url: string;
    title: string;
    timestamp: string;
    duration: number;
  }[];
  savedHighlights: {
    text: string;
    url: string;
    timestamp: string;
  }[];
}

export interface PlagiarismCheck {
  id: string;
  userId: string;
  projectId?: string;
  studentText: string;
  sources: ResearchSource[];
  results: {
    overallSimilarity: number;
    matches: {
      sourceId: string;
      sourceTitle: string;
      matchedText: string;
      studentText: string;
      similarity: number;
      startIndex: number;
      endIndex: number;
    }[];
  };
  timestamp: string;
}

export interface ParaphrasingAttempt {
  id: string;
  userId: string;
  projectId?: string;
  originalText: string;
  paraphrasedVersions: {
    text: string;
    readingLevel: string;
    explanations: string[];
    vocabularySuggestions: string[];
  }[];
  selectedVersion?: number;
  timestamp: string;
}

export interface Citation {
  source: ResearchSource;
  format: 'kid-friendly' | 'mla' | 'apa';
  text: string;
}

export type CitationFormat = 'kid-friendly' | 'mla' | 'apa';
