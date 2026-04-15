/**
 * Sistema de Repetición Espaciada — Academia Gael
 * Basado en el algoritmo SM-2 (SuperMemo) simplificado
 * 
 * Cuando Danna falla una pregunta, esta se agrega a la cola de repaso.
 * Las preguntas reaparecen en intervalos crecientes:
 *   - Primer error: reaparece en 1 día
 *   - Segundo intento: si acierta, reaparece en 3 días
 *   - Tercer intento: si acierta, reaparece en 7 días
 *   - Cuarto intento: si acierta, reaparece en 14 días
 *   - Quinto intento: si acierta, se marca como DOMINADA
 *   - Si falla en cualquier momento: vuelve al intervalo de 1 día
 */

import { IcfesCategory, IcfesQuestion, CATEGORY_LABELS } from './IcfesQuestionBank';

const STORAGE_KEY = 'nova_spaced_repetition';

// Intervalos en días según nivel de dominio
const INTERVALS = [1, 3, 7, 14, 30]; // días

export interface RepetitionCard {
  questionId: string;
  category: IcfesCategory;
  competency?: string;
  /** The question text for display */
  questionText: string;
  /** Number of successful reviews (0 = just failed) */
  level: number;
  /** Timestamp of when this card is due for review */
  dueDate: number;
  /** Timestamp of last review */
  lastReviewed: number;
  /** Total times reviewed */
  totalReviews: number;
  /** Total times answered correctly */
  totalCorrect: number;
  /** The full question data for re-testing */
  questionData: IcfesQuestion;
}

export interface RepetitionStats {
  totalCards: number;
  dueToday: number;
  mastered: number;
  byArea: Record<IcfesCategory, { total: number; due: number; mastered: number }>;
  streakDays: number;
  lastReviewDate: string | null;
}

// ─── Load all cards from storage ───
function loadCards(): RepetitionCard[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* corrupted */ }
  return [];
}

// ─── Save all cards to storage ───
function saveCards(cards: RepetitionCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

// ─── Add a failed question to the review queue ───
export function addFailedQuestion(question: IcfesQuestion): void {
  const cards = loadCards();
  
  // Check if already exists
  const existing = cards.find(c => c.questionId === question.id);
  if (existing) {
    // Reset to level 0 (failed again)
    existing.level = 0;
    existing.dueDate = Date.now() + INTERVALS[0] * 24 * 60 * 60 * 1000;
    existing.lastReviewed = Date.now();
    existing.totalReviews += 1;
    existing.questionData = question;
  } else {
    // New card
    cards.push({
      questionId: question.id,
      category: question.category,
      competency: question.competency,
      questionText: question.text.substring(0, 120) + (question.text.length > 120 ? '...' : ''),
      level: 0,
      dueDate: Date.now() + INTERVALS[0] * 24 * 60 * 60 * 1000,
      lastReviewed: Date.now(),
      totalReviews: 1,
      totalCorrect: 0,
      questionData: question
    });
  }
  
  saveCards(cards);
}

// ─── Process multiple results (from diagnostic or simulator) ───
export function processTestResults(
  questions: IcfesQuestion[], 
  answers: Record<string, string>
): { added: number; improved: number } {
  let added = 0;
  let improved = 0;
  
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    
    if (answer !== q.correctId) {
      // Wrong answer → add to spaced repetition
      addFailedQuestion(q);
      added++;
    } else {
      // Correct answer → if it's in the queue, promote it
      const promoted = promoteCard(q.id);
      if (promoted) improved++;
    }
  }
  
  return { added, improved };
}

// ─── Promote a card (answered correctly in review) ───
export function promoteCard(questionId: string): boolean {
  const cards = loadCards();
  const card = cards.find(c => c.questionId === questionId);
  
  if (!card) return false;
  
  card.level = Math.min(card.level + 1, INTERVALS.length);
  card.totalCorrect += 1;
  card.totalReviews += 1;
  card.lastReviewed = Date.now();
  
  if (card.level >= INTERVALS.length) {
    // MASTERED! Keep in history but mark as done
    card.dueDate = Infinity;
  } else {
    card.dueDate = Date.now() + INTERVALS[card.level] * 24 * 60 * 60 * 1000;
  }
  
  saveCards(cards);
  return true;
}

// ─── Demote a card (answered incorrectly in review) ───
export function demoteCard(questionId: string): void {
  const cards = loadCards();
  const card = cards.find(c => c.questionId === questionId);
  
  if (!card) return;
  
  card.level = 0; // Reset to beginning
  card.totalReviews += 1;
  card.lastReviewed = Date.now();
  card.dueDate = Date.now() + INTERVALS[0] * 24 * 60 * 60 * 1000;
  
  saveCards(cards);
}

// ─── Get cards due for review TODAY ───
export function getDueCards(): RepetitionCard[] {
  const cards = loadCards();
  const now = Date.now();
  return cards
    .filter(c => c.dueDate <= now && c.level < INTERVALS.length)
    .sort((a, b) => a.dueDate - b.dueDate);
}

// ─── Get questions from due cards (for review mode) ───
export function getDueQuestions(): IcfesQuestion[] {
  return getDueCards().map(c => c.questionData);
}

// ─── Get statistics ───
export function getRepetitionStats(): RepetitionStats {
  const cards = loadCards();
  const now = Date.now();
  const areas: IcfesCategory[] = ['LECTURA_CRITICA', 'MATEMATICAS', 'SOCIALES', 'CIENCIAS', 'INGLES'];
  
  const byArea = {} as RepetitionStats['byArea'];
  for (const area of areas) {
    const areaCards = cards.filter(c => c.category === area);
    byArea[area] = {
      total: areaCards.length,
      due: areaCards.filter(c => c.dueDate <= now && c.level < INTERVALS.length).length,
      mastered: areaCards.filter(c => c.level >= INTERVALS.length).length
    };
  }

  // Calculate streak
  const lastReview = localStorage.getItem('nova_last_review_date');
  let streakDays = parseInt(localStorage.getItem('nova_review_streak') || '0', 10);
  
  return {
    totalCards: cards.length,
    dueToday: cards.filter(c => c.dueDate <= now && c.level < INTERVALS.length).length,
    mastered: cards.filter(c => c.level >= INTERVALS.length).length,
    byArea,
    streakDays,
    lastReviewDate: lastReview
  };
}

// ─── Record that a review session was completed today ───
export function recordReviewSession(): void {
  const today = new Date().toISOString().split('T')[0];
  const lastReview = localStorage.getItem('nova_last_review_date');
  let streak = parseInt(localStorage.getItem('nova_review_streak') || '0', 10);
  
  if (lastReview) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (lastReview === yesterday) {
      streak += 1; // Consecutive day!
    } else if (lastReview !== today) {
      streak = 1; // Reset streak (missed a day)
    }
  } else {
    streak = 1;
  }
  
  localStorage.setItem('nova_last_review_date', today);
  localStorage.setItem('nova_review_streak', streak.toString());
}

// ─── Get a summary message for the dashboard ───
export function getReviewSummary(): { message: string; urgency: 'none' | 'low' | 'medium' | 'high' } {
  const stats = getRepetitionStats();
  
  if (stats.totalCards === 0) {
    return { message: 'Completa tu diagnóstico para activar el sistema de repaso inteligente.', urgency: 'none' };
  }
  
  if (stats.dueToday === 0) {
    return { message: `¡Estás al día! ${stats.mastered} temas dominados. Próximo repaso mañana.`, urgency: 'none' };
  }
  
  if (stats.dueToday <= 5) {
    return { message: `Tienes ${stats.dueToday} preguntas para repasar hoy. ¡Solo toma 5 minutos!`, urgency: 'low' };
  }
  
  if (stats.dueToday <= 15) {
    return { message: `${stats.dueToday} preguntas pendientes de repaso. Esto refuerza lo que aprendiste.`, urgency: 'medium' };
  }
  
  return { message: `⚠️ ${stats.dueToday} preguntas acumuladas. Si no repasas, se olvidan. ¡Empieza ahora!`, urgency: 'high' };
}
