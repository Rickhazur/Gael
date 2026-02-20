import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, BookOpen, CheckCircle, XCircle, Star, RefreshCw, Clock, TrendingUp } from "lucide-react";
import { useRewards } from "@/hooks/useRewards_mod";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import type { PersonalizedContent } from "@/hooks/usePersonalizedContent_mod";

interface DailyNewsProps {
  onComplete: (score: number, coins: number) => void;
  onBack: () => void;
  personalizedContent?: PersonalizedContent;
  immersionMode?: 'bilingual' | 'standard';
}

interface VocabWord {
  word: string;
  definition: string;
  example: string;
  translation?: string;
}

interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface Article {
  id: string;
  title: string;
  emoji: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  content: string;
  contentEs: string; // Added Spanish content
  vocabulary: VocabWord[];
  questions: ComprehensionQuestion[];
}

// Generate dynamic articles based on personalized content
const generateDynamicArticles = (content: PersonalizedContent): Article[] => {
  const articles: Article[] = [];
  const gradeLevel = content.gradeLevel;
  const level = gradeLevel <= 2 ? 'beginner' : gradeLevel <= 4 ? 'intermediate' : 'advanced';

  // Group vocabulary by category
  const vocabByCategory = content.vocabulary.reduce((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {} as Record<string, typeof content.vocabulary>);

  // Generate articles for each focus area
  content.focusAreas.forEach((area, areaIdx) => {
    const relatedVocab = content.vocabulary.filter(v =>
      v.sourceChallenge?.includes(area) ||
      content.challenges.some(c => c.englishConnection === area && c.area === v.category)
    );

    const vocabToUse = relatedVocab.length > 0 ? relatedVocab : content.vocabulary.slice(areaIdx * 4, (areaIdx + 1) * 4);
    if (vocabToUse.length === 0) return;

    const vocabWords = vocabToUse.slice(0, 4).map(v => ({
      word: v.word,
      definition: v.definition,
      example: v.example,
      translation: v.translation,
    }));

    const categoryEmoji: Record<string, string> = {
      science: '🔬',
      math: '🔢',
      history: '📜',
      writing: '✏️',
      general: '📚',
    };

    const emoji = categoryEmoji[vocabToUse[0]?.category] || '📰';
    const category = vocabToUse[0]?.category?.charAt(0).toUpperCase() + vocabToUse[0]?.category?.slice(1) || 'Learning';

    // Generate article content using the vocabulary
    const articleContent = generateArticleContent(vocabToUse, area, gradeLevel);
    const questions = generateQuestions(vocabToUse, articleContent);

    articles.push({
      id: `dynamic-${areaIdx}`,
      title: articleContent.title,
      emoji,
      category,
      level,
      readTime: Math.max(2, Math.ceil(articleContent.text.split(' ').length / 100)),
      content: articleContent.text,
      contentEs: articleContent.textEs, // Pass Spanish content
      vocabulary: vocabWords,
      questions,
    });
  });

  // Add at least one article if none generated
  if (articles.length === 0 && content.vocabulary.length > 0) {
    const vocabWords = content.vocabulary.slice(0, 4).map(v => ({
      word: v.word,
      definition: v.definition,
      example: v.example,
      translation: v.translation,
    }));

    articles.push({
      id: 'dynamic-default',
      title: 'Learning New Words',
      emoji: '📚',
      category: 'Vocabulary',
      level,
      readTime: 2,
      content: `Today we will learn some important words for school. ${content.vocabulary.slice(0, 3).map(v => `The word "${v.word}" means ${v.definition.toLowerCase()}.`).join(' ')} These words will help you in your studies!`,
      contentEs: `Hoy aprenderemos algunas palabras importantes para la escuela. Estas palabras te ayudarán en tus estudios. ¡Sigue practicando!`,
      vocabulary: vocabWords,
      questions: generateQuestions(content.vocabulary.slice(0, 4), { title: '', text: '' }),
    });
  }

  return articles;
};

const generateArticleContent = (
  vocab: PersonalizedContent['vocabulary'],
  focusArea: string,
  gradeLevel: number
): { title: string; text: string; textEs: string } => { // Return type updated
  /* ESL STORY TEMPLATES (A1 - B2) */
  const templates = {
    // Replaces 'Academic vocabulary' -> Daily Life & Routines (A1/A2)
    'Academic vocabulary practice': {
      title: 'My Morning Routine',
      titleEs: 'Mi Rutina de la Mañana',
      text: (words: string[]) => `Every morning, I wake up at 7:00 AM. First, I brush my teeth in the bathroom. Then, I go to the kitchen to eat ${words[0] || 'breakfast'}. Usually, I like to have ${words[1] || 'cereal'} with milk. After eating, I put on my ${words[2] || 'clothes'} for school. I always grab my ${words[3] || 'backpack'} before I leave. Starting the day on time is important!`,
      textEs: (words: string[]) => `Cada mañana, me despierto a las 7:00 AM. Primero, me lavo los dientes en el baño. Luego, voy a la cocina a comer el ${words[0] || 'desayuno'}. Usualmente, me gusta comer ${words[1] || 'cereales'} con leche. Después de comer, me pongo mi ${words[2] || 'ropa'} para la escuela. Siempre tomo mi ${words[3] || 'mochila'} antes de salir. ¡Empezar el día a tiempo es importante!`,
    },
    // Replaces 'Math' -> Shopping & Money (A2)
    'Reading comprehension for math': {
      title: 'A Trip to the Store',
      titleEs: 'Un Viaje a la Tienda',
      text: (words: string[]) => `On Saturday, Tom went to the supermarket with his mom. He wanted to buy some snacks. He looked at the ${words[0] || 'price'} of the cookies. They cost five dollars. "That is too ${words[1] || 'expensive'}," said his mom. So, Tom chose an apple instead. It was ${words[2] || 'cheaper'} and healthier. At the register, his mom paid with ${words[3] || 'cash'}. Shopping is better when you make smart choices!`,
      textEs: (words: string[]) => `El sábado, Tom fue al supermercado con su mamá. Él quería comprar algunas meriendas. Miró el ${words[0] || 'precio'} de las galletas. C costaban cinco dólares. "Eso es demasiado ${words[1] || 'caro'}", dijo su mamá. Entonces, Tom eligió una manzana. Era más ${words[2] || 'barata'} y saludable. En la caja, su mamá pagó con ${words[3] || 'efectivo'}. ¡Comprar es mejor cuando tomas decisiones inteligentes!`,
    },
    // Replaces 'Structure' -> Friends & Hobbies (B1)
    'Sentence structure and clarity': {
      title: 'The Weekend Soccer Game',
      titleEs: 'El Partido de Fútbol del Fin de Semana',
      text: (words: string[]) => `Last weekend, our team played a big soccer match in the park. My friend Sarah is the best ${words[0] || 'player'} on the team. During the game, she kicked the ball very ${words[1] || 'calmly'} into the goal. We all cheered loudly! After the game, we went to get ice cream to celebrate our ${words[2] || 'victory'}. Spending time with friends is my favorite ${words[3] || 'activity'}.`,
      textEs: (words: string[]) => `El fin de semana pasado, nuestro equipo jugó un gran partido de fútbol en el parque. Mi amiga Sarah es la mejor ${words[0] || 'jugadora'} del equipo. Durante el juego, ella pateó el balón muy ${words[1] || 'tranquilamente'} hacia la portería. ¡Todos gritamos fuerte! Después del juego, fuimos por helado para celebrar nuestra ${words[2] || 'victoria'}. Pasar tiempo con amigos es mi ${words[3] || 'actividad'} favorita.`,
    },
    // Replaces 'Sequence' -> Cooking & Food (B1)
    'Sequence words and imperative verbs': {
      title: 'Making the Perfect Sandwich',
      titleEs: 'Haciendo el Sándwich Perfecto',
      text: (words: string[]) => `Are you hungry? Let's make a sandwich! First, get two slices of bread. Next, spread some ${words[0] || 'butter'} or mayonnaise on the bread. Then, add your favorite ${words[1] || 'ingredients'} like cheese and tomato. If you like it crunchy, add some ${words[2] || 'lettuce'} too. Finally, put the other slice of bread on top. Now, ${words[3] || 'enjoy'} your delicious lunch!`,
      textEs: (words: string[]) => `¿Tienes hambre? ¡Hagamos un sándwich! Primero, toma dos rebanadas de pan. Luego, unta un poco de ${words[0] || 'mantequilla'} o mayonesa en el pan. Después, añade tus ${words[1] || 'ingredientes'} favoritos como queso y tomate. Si te gusta crujiente, añade un poco de ${words[2] || 'lechuga'} también. Finalmente, pon la otra rebanada de pan encima. ¡Ahora, ${words[3] || 'disfruta'} tu delicioso almuerzo!`,
    },
    // Replaces 'Dates' -> Travel & Adventure (B2)
    'Ordinal numbers and date expressions': {
      title: ' The Mystery of the Old Map',
      titleEs: 'El Misterio del Mapa Viejo',
      text: (words: string[]) => `While cleaning the attic, Leo found a dusty box. Inside, there was a strange, old map. It showed a path to a hidden ${words[0] || 'treasure'} in the forest. Leo felt very ${words[1] || 'curious'} and decided to follow it. He walked past the river and climbed a big hill. Suddenly, he saw a glowing light inside a ${words[2] || 'cave'}. What an amazing ${words[3] || 'adventure'}!`,
      textEs: (words: string[]) => `Mientras limpiaba el ático, Leo encontró una caja polvorienta. Adentro, había un extraño mapa viejo. Mostraba un camino hacia un ${words[0] || 'tesoro'} escondido en el bosque. Leo se sintió muy ${words[1] || 'curioso'} y decidió seguirlo. Caminó pasando el río y subió una gran colina. De repente, vio una luz brillante dentro de una ${words[2] || 'cueva'}. ¡Qué increíble ${words[3] || 'aventura'}!`,
    },
  };

  // Default fallback for any unmapped focus area
  const template = templates[focusArea as keyof typeof templates] || templates['Academic vocabulary practice'];
  const words = vocab.map(v => v.word);
  const wordsEs = vocab.map(v => v.translation || v.word);

  return {
    title: template.title,
    text: template.text(words),
    textEs: template.textEs(wordsEs),
  };
};

const generateQuestions = (
  vocab: PersonalizedContent['vocabulary'],
  article: { title: string; text: string }
): ComprehensionQuestion[] => {
  const questions: ComprehensionQuestion[] = [];

  // Vocabulary questions
  vocab.slice(0, 3).forEach((v, idx) => {
    const wrongOptions = vocab
      .filter(other => other.word !== v.word)
      .map(other => other.definition)
      .slice(0, 3);

    while (wrongOptions.length < 3) {
      wrongOptions.push(`Not related to ${v.word}`);
    }

    const options = [v.definition, ...wrongOptions].sort(() => Math.random() - 0.5);

    questions.push({
      question: `What does "${v.word}" mean?`,
      options,
      correctIndex: options.indexOf(v.definition),
    });
  });

  return questions;
};

const DailyNews_mod = ({ onComplete, onBack, personalizedContent, immersionMode = 'bilingual' }: DailyNewsProps) => {
  const { addCoins } = useRewards();
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [showVocab, setShowVocab] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [articlesRead, setArticlesRead] = useState(0);
  const [showBilingual, setShowBilingual] = useState(false); // New state for toggle

  // Generate dynamic articles from personalized content
  const dynamicArticles = useMemo(() => {
    if (personalizedContent && personalizedContent.vocabulary.length > 0) {
      return generateDynamicArticles(personalizedContent);
    }
    return [];
  }, [personalizedContent]);

  useEffect(() => {
    if (selectedLevel) {
      // Use dynamic articles if available, filtered by level
      if (dynamicArticles.length > 0) {
        const filtered = dynamicArticles.filter(a => a.level === selectedLevel);
        // If no articles match the level, show all dynamic articles
        setArticles(filtered.length > 0 ? filtered.sort(() => Math.random() - 0.5) : dynamicArticles.sort(() => Math.random() - 0.5));
      } else {
        setArticles([]);
      }
    }
  }, [selectedLevel, dynamicArticles]);

  const speakText = useCallback((text: string) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }, []);

  const handleSelectArticle = (article: Article) => {
    setCurrentArticle(article);
    setShowVocab(false);
    setShowQuiz(false);
    setCurrentQuestion(0);
    setAnswers([]);
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentArticle?.questions[currentQuestion].correctIndex;
    if (isCorrect) {
      const coins = selectedLevel === 'beginner' ? 2 : selectedLevel === 'intermediate' ? 3 : 5;
      setTotalCoins(prev => prev + coins);
      addCoins(coins, 'Daily News Quiz');
    }

    setAnswers([...answers, index]);
  };

  const handleNextQuestion = () => {
    if (!currentArticle) return;

    if (currentQuestion < currentArticle.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz finished
      const correctCount = answers.filter((a, i) => a === currentArticle.questions[i].correctIndex).length +
        (selectedAnswer === currentArticle.questions[currentQuestion].correctIndex ? 1 : 0);

      const readBonus = selectedLevel === 'beginner' ? 5 : selectedLevel === 'intermediate' ? 8 : 12;
      setTotalCoins(prev => prev + readBonus);
      addCoins(readBonus, 'Article Completed');
      setArticlesRead(prev => prev + 1);

      toast.success(`Article completed! ${correctCount}/${currentArticle.questions.length} correct!`);
      setCurrentArticle(null);
      setShowQuiz(false);
    }
  };

  const handleFinish = () => {
    onComplete(articlesRead * 20, totalCoins);
  };

  if (!selectedLevel) {
    return (
      <motion.div className="flex-1 flex flex-col bg-[#f0e7d5] p-2 md:p-8 relative overflow-hidden font-serif" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* NEWSPAPER HEADER */}
        <div className="border-b-4 border-black pb-4 mb-8 text-center relative z-10">
          <div className="flex justify-between border-b-2 border-black mb-1 px-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Late Edition</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Vol. 1</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-black tracking-tighter" style={{ fontFamily: 'Times New Roman, serif' }}>
            THE DAILY NOVA
          </h1>
          <div className="flex justify-center items-center gap-4 mt-2 border-t-2 border-black pt-1">
            <span className="text-xs font-bold uppercase">Weather: Sunny & Bright</span>
            <span className="w-1 h-1 bg-black rounded-full"></span>
            <span className="text-xs font-bold uppercase">Price: One Smile</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 relative z-10">
          <h3 className="text-2xl font-bold text-black italic bg-white px-6 py-2 border-2 border-black shadow-[4px_4px_0_0_#000] transform -rotate-2">
            {immersionMode === 'standard' ? 'EXTRA! EXTRA! ¡Elige tu Edición!' : 'EXTRA! EXTRA! Choose Your Edition!'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
            {/* BEGINNER: COMICS SECTION */}
            <motion.button
              onClick={() => setSelectedLevel('beginner')}
              className="bg-white p-4 border-4 border-black shadow-[8px_8px_0_0_#000] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#000] transition-all text-left flex flex-col h-64 relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-cyan-400"></div>
              <div className="bg-cyan-100 mb-2 px-2 py-0.5 inline-block border border-black text-xs font-black uppercase transform -rotate-1">The Comics Section</div>
              <div className="flex-1 border-2 border-black border-dashed bg-slate-50 p-2 flex items-center justify-center opacity-80 group-hover:opacity-100 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]">
                <span className="text-6xl filter drop-shadow-md">🧩</span>
              </div>
              <h4 className="font-black text-xl mt-3 uppercase">Beginner</h4>
              <p className="text-sm leading-tight text-slate-600 font-sans">Short stories & fun pictures. Great for starting out!</p>
            </motion.button>

            {/* INTERMEDIATE: LOCAL NEWS */}
            <motion.button
              onClick={() => setSelectedLevel('intermediate')}
              className="bg-[#fdfbf7] p-4 border-4 border-black shadow-[8px_8px_0_0_#94a3b8] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#94a3b8] transition-all text-left flex flex-col h-64 relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
              <div className="bg-amber-100 mb-2 px-2 py-0.5 inline-block border border-black text-xs font-black uppercase transform rotate-1">Local Headlines</div>
              <div className="flex-1 flex flex-col gap-2 p-1">
                <div className="h-2 w-full bg-slate-200"></div>
                <div className="h-2 w-3/4 bg-slate-200"></div>
                <div className="flex-1 border border-slate-300 bg-slate-100 flex items-center justify-center text-4xl grayscale group-hover:grayscale-0 transition-all">📸</div>
                <div className="h-2 w-full bg-slate-200"></div>
              </div>
              <h4 className="font-black text-xl mt-3 font-serif">Intermediate</h4>
              <p className="text-sm leading-tight text-slate-600 font-serif italic">Community stories and daily events in detail.</p>
            </motion.button>

            {/* ADVANCED: WORLD REPORT */}
            <motion.button
              onClick={() => setSelectedLevel('advanced')}
              className="bg-slate-100 p-4 border-4 border-black shadow-[8px_8px_0_0_#475569] hover:-translate-y-2 hover:shadow-[12px_12px_0_0_#475569] transition-all text-left flex flex-col h-64 relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-600"></div>
              <div className="bg-rose-100 mb-2 px-2 py-0.5 inline-block border border-black text-xs font-black uppercase w-fit">World Report</div>
              <div className="flex-1 grid grid-cols-2 gap-2 p-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="col-span-2 h-2 w-full bg-slate-300"></div>
                <div className="col-span-2 h-2 w-full bg-slate-300"></div>
                <div className="col-span-1 bg-slate-200 h-full border border-slate-300"></div>
                <div className="col-span-1 flex flex-col gap-1">
                  <div className="h-1 w-full bg-slate-300"></div>
                  <div className="h-1 w-full bg-slate-300"></div>
                  <div className="h-1 w-full bg-slate-300"></div>
                </div>
              </div>
              <h4 className="font-black text-xl mt-3 font-serif">Advanced</h4>
              <p className="text-sm leading-tight text-slate-600 font-serif">Complex analysis and long-form journalism.</p>
            </motion.button>
          </div>

          <div className="mt-8">
            <Button variant="ghost" onClick={onBack} className="font-bold underline font-sans text-slate-500 hover:text-black">
              ← Go back to Lobby
            </Button>
          </div>
        </div>

        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>
      </motion.div>
    );
  }

  if (!currentArticle) {
    return (
      <motion.div className="flex-1 flex flex-col bg-[#f0e7d5] p-2 md:p-8 font-serif" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6 border-b-2 border-black pb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-black/10 text-black border-2 border-transparent hover:border-black rounded-full" onClick={() => setSelectedLevel(null)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-3xl font-black text-black capitalize tracking-tight font-serif">{selectedLevel} Section</h2>
              <div className="flex gap-2">
                <span className="text-xs font-bold bg-black text-white px-2 py-0.5 uppercase">Page 3</span>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{articlesRead} articles read</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 border-2 border-black px-3 py-1 shadow-[2px_2px_0_0_#000]">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span className="font-black text-black font-mono">{totalCoins} CENTS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-4">
          {articles.map((article, index) => (
            <motion.button
              key={article.id}
              onClick={() => handleSelectArticle(article)}
              className="bg-white p-4 border border-slate-300 shadow-md flex flex-col gap-2 hover:border-black hover:shadow-[8px_8px_0_0_#000] transition-all group text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-start border-b border-black pb-2 mb-2">
                <span className="font-black text-2xl group-hover:scale-110 transition-transform">{article.emoji}</span>
                <span className="text-[10px] font-bold uppercase bg-slate-100 px-1 border border-slate-200">{article.category}</span>
              </div>
              <h3 className="font-bold text-xl text-black leading-tight font-serif group-hover:underline decoration-2 underline-offset-2">{article.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 font-serif">Read the full story about {article.title} to learn {article.vocabulary.length} new words...</p>

              <div className="mt-auto pt-4 flex justify-between items-center text-xs font-bold uppercase text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime} MIN READ</span>
                <span className="text-black group-hover:text-rose-600">READ NOW →</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  if (showQuiz) {
    const question = currentArticle.questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctIndex;

    return (
      <motion.div className="flex-1 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => setShowQuiz(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Evaluación de Comprensión</h2>
            <Progress value={((currentQuestion + 1) / currentArticle.questions.length) * 100} className="h-2 mt-1" />
          </div>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1}/{currentArticle.questions.length}
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-foreground mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctIndex;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${showResult && isCorrectAnswer ? 'bg-green-100 border-2 border-green-500' :
                      showResult && isSelected && !isCorrect ? 'bg-red-100 border-2 border-red-500' :
                        isSelected ? 'bg-primary/20 border-2 border-primary' :
                          'bg-muted/50 border-2 border-transparent hover:border-primary/30'
                      }`}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${showResult && isCorrectAnswer ? 'bg-green-500 text-white' :
                      showResult && isSelected && !isCorrect ? 'bg-red-500 text-white' :
                        'bg-muted text-muted-foreground'
                      }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-foreground">{option}</span>
                    {showResult && isCorrectAnswer && <CheckCircle className="w-6 h-6 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                  </motion.button>
                );
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}
              >
                <p className="font-medium text-foreground">
                  {isCorrect ? '🎉 Correct! Great job!' : '💪 Keep trying! The correct answer is highlighted.'}
                </p>
              </motion.div>
            )}
          </motion.div>

          {showResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
              <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestion < currentArticle.questions.length - 1 ? 'Siguiente Pregunta' : 'Terminar Evaluación'}
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="flex-1 flex flex-col overflow-hidden bg-[#fbf8f1] border-x-8 border-slate-900 shadow-2xl max-w-4xl mx-auto w-full relative" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* PAPER TEXTURE */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b-4 border-double border-black bg-white relative z-10">
        <Button variant="ghost" size="icon" onClick={() => setCurrentArticle(null)} className="hover:bg-black hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex-1 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] block mb-1">Breaking News</span>
          <h2 className="text-2xl md:text-3xl font-black text-black font-serif leading-none uppercase">{currentArticle.title}</h2>
          <div className="flex justify-center items-center gap-4 text-xs font-bold text-slate-500 mt-2 font-mono">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {currentArticle.readTime} MIN</span>
            <span>•</span>
            <span className="uppercase">{currentArticle.category}</span>
          </div>
        </div>

        {/* BILINGUAL TOGGLE */}
        <button
          onClick={() => setShowBilingual(!showBilingual)}
          className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${showBilingual ? 'bg-cyan-100 border-cyan-500 text-cyan-900' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-800 hover:text-slate-800'}`}
        >
          <span className="text-2xl">👓</span>
          <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1">{showBilingual ? 'BILINGUAL' : 'ENGLISH'}</span>
        </button>

        <Button variant="outline" size="icon" onClick={() => speakText(currentArticle.content)} className="border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-0.5 hover:shadow-none transition-all hidden md:flex">
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <div className="bg-white p-6 md:p-8 border border-slate-200 shadow-lg relative">
          <div className="absolute -top-4 -right-4 bg-yellow-300 px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000] transform rotate-3 font-black text-2xl z-20">
            {currentArticle.emoji}
          </div>

          <div className="prose prose-lg max-w-none font-serif text-slate-800 leading-loose">
            {currentArticle.content.split('\n\n').map((paragraph, index) => {
              const paragraphEs = currentArticle.contentEs ? currentArticle.contentEs.split('\n\n')[index] : null;

              return (
                <div key={index} className="mb-8">
                  <p className={`mb-2 ${index === 0 ? 'first-letter:text-6xl first-letter:font-black first-letter:text-black first-letter:mr-2 first-letter:float-left' : ''}`}>
                    {paragraph}
                  </p>

                  {/* TRANSLATION OVERLAY */}
                  <AnimatePresence>
                    {showBilingual && paragraphEs && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-cyan-50 p-3 border-l-4 border-cyan-400 text-cyan-900 font-sans text-base italic leading-relaxed"
                      >
                        {paragraphEs}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vocabulary Section */}
        <div className="mt-8 border-t-4 border-black pt-6">
          <h3 className="font-black text-xl uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="bg-black text-white px-2 py-1 text-sm">VOCABULARY</span>
            Words of the Day
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentArticle.vocabulary.map((vocab, index) => (
              <div key={vocab.word} className="bg-slate-100 p-4 border-l-4 border-rose-500">
                <div className="flex justify-between items-start">
                  <span className="font-black text-lg text-slate-900">{vocab.word}</span>
                  <button onClick={() => speakText(vocab.word)} className="text-slate-400 hover:text-black"><Volume2 className="w-4 h-4" /></button>
                </div>
                {immersionMode === 'standard' && vocab.translation && <div className="text-xs font-bold text-rose-600 uppercase mb-1">{vocab.translation}</div>}
                <p className="text-sm text-slate-600 leading-tight">{vocab.definition}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Button */}
      <div className="p-4 bg-white border-t-2 border-black relative z-10">
        <Button onClick={handleStartQuiz} className="w-full py-6 text-lg font-black bg-black text-white hover:bg-rose-600 transition-colors border-2 border-transparent uppercase tracking-widest shadow-lg">
          <TrendingUp className="w-6 h-6 mr-2" />
          {immersionMode === 'standard' ? 'TOMAR EXAMEN' : 'TAKE QUIZ'}
        </Button>
      </div>
    </motion.div>
  );
};

export default DailyNews_mod;
