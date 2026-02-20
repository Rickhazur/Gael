import type { EnglishLevel } from '@/context/LearningContext';

interface PhraseTemplateGroup {
  topic: string;
  examples: string[];
}

export interface EnglishPhraseTemplateConfig {
  level: EnglishLevel;
  groups: PhraseTemplateGroup[];
}

export const ENGLISH_PHRASE_TEMPLATES: Record<EnglishLevel, EnglishPhraseTemplateConfig> = {
  UNKNOWN: {
    level: 'UNKNOWN',
    groups: [
      {
        topic: 'me_and_my_family',
        examples: [
          'I am Ana.',
          'My name is Carlos.',
          'I am eight.',
          'I am nine years old.',
          'This is my mom.',
          'This is my dad.',
          'This is my brother.',
          'This is my sister.',
          'I love my mom.',
          'I love my dad.',
        ],
      },
    ],
  },
  A1: {
    level: 'A1',
    groups: [
      {
        topic: 'me_and_my_family',
        examples: [
          'I am Ana.',
          'My name is Carlos.',
          'I am eight.',
          'I am nine years old.',
          'This is my mom.',
          'This is my dad.',
          'This is my brother.',
          'This is my sister.',
          'I love my mom.',
          'I love my dad.',
        ],
      },
      {
        topic: 'classroom_and_colors',
        examples: [
          'The apple is red.',
          'The sky is blue.',
          'The sun is yellow.',
          'The cat is black.',
          'This is my book.',
          'This is my pencil.',
          'The chair is big.',
        ],
      },
      {
        topic: 'numbers_and_things',
        examples: [
          'I have one dog.',
          'I have two cats.',
          'I have three books.',
          'I have four pencils.',
          'I have five friends.',
        ],
      },
      {
        topic: 'feelings',
        examples: [
          'I am happy.',
          'I am sad.',
          'I am tired.',
          'I am okay.',
          'I am hungry.',
        ],
      },
      {
        topic: 'simple_routine',
        examples: [
          'I wake up.',
          'I go to school.',
          'I go home.',
          'I eat.',
          'I sleep.',
        ],
      },
    ],
  },
  A2: {
    level: 'A2',
    groups: [
      {
        topic: 'daily_routine',
        examples: [
          'I usually wake up at seven.',
          'I have breakfast at home.',
          'I go to school by bus.',
          'I have lunch at school.',
          'I do my homework in the afternoon.',
          'I play with my friends in the park.',
          'I go to bed at nine.',
        ],
      },
      {
        topic: 'food_and_likes',
        examples: [
          'I like pizza.',
          'I like apples, but I do not like bananas.',
          'I like milk, but I do not like coffee.',
          'My favorite food is chicken.',
          'I always drink water.',
          'I sometimes eat chocolate.',
        ],
      },
      {
        topic: 'home_and_town',
        examples: [
          'I live in a house.',
          'My house is small but nice.',
          'My bedroom is big.',
          'There is a park near my house.',
          'There is a school in my street.',
          'There are many cars in my city.',
        ],
      },
      {
        topic: 'free_time',
        examples: [
          'I like playing football.',
          'I like reading comics.',
          'I like watching cartoons.',
          'I like playing video games.',
          'At the weekend I play with my cousins.',
        ],
      },
      {
        topic: 'controlled_past_simple',
        examples: [
          'Yesterday I played with my friends.',
          'Yesterday I watched a movie.',
          'Last weekend I visited my grandma.',
          'Last Sunday I went to the park.',
          'I was happy yesterday.',
        ],
      },
    ],
  },
  B1: {
    level: 'B1',
    groups: [
      {
        topic: 'experiences_and_opinions',
        examples: [
          'I went to the zoo last month.',
          'I saw many animals and I loved the lions.',
          'I think English is fun because I can watch cartoons.',
          'I want to learn more English to travel.',
        ],
      },
      {
        topic: 'school_and_subjects',
        examples: [
          'My favorite subject is science because we do experiments.',
          'I do not like exams, but I study to get good grades.',
          'I am going to practice English every day this week.',
        ],
      },
    ],
  },
  B2: {
    level: 'B2',
    groups: [
      {
        topic: 'opinions_and_arguments',
        examples: [
          'In my opinion, learning English is important because it helps us talk to people from other countries.',
          'On the one hand, video games are fun; on the other hand, we should not play too much.',
        ],
      },
    ],
  },
};

export const getEnglishPhraseTemplates = (level: EnglishLevel): EnglishPhraseTemplateConfig =>
  ENGLISH_PHRASE_TEMPLATES[level];

