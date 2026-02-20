import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Target, BookOpen, CheckCircle2, PlayCircle, ChevronRight, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type AssignmentAnalysis } from "./AssignmentIntake_mod";

export interface StudySession {
  id: string;
  day: number;
  title: string;
  objectives: string[];
  activities: {
    type: "flashcards" | "practice" | "eval" | "writing" | "reading";
    title: string;
    duration: number;
    completed: boolean;
  }[];
  estimatedTime: number;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  assignmentId: string;
  title: string;
  sessions: StudySession[];
  createdAt: number;
  progress: number;
}

interface StudyPlanGeneratorProps {
  analysis: AssignmentAnalysis;
  onStartSession: (session: StudySession, planId: string) => void;
  onBack: () => void;
  immersionMode?: 'bilingual' | 'standard';
}

const generateStudyPlan = (analysis: AssignmentAnalysis): StudyPlan => {
  const sessions: StudySession[] = [];
  const totalTime = analysis.estimatedTime;

  // Use suggested activities if available, otherwise fallback
  const suggested = (analysis.suggestedActivities as any[]) || [];
  const dynamicActivities = suggested.length > 0
    ? suggested.map(a => ({
      type: (a.type as any) || "practice",
      title: typeof a === 'object' ? a.title : a,
      duration: typeof a === 'object' ? a.duration : 10,
      completed: false
    }))
    : [];

  const numSessions = Math.max(1, Math.ceil(dynamicActivities.length / 3)); // Approx 3 activities per session
  const timePerSession = Math.ceil(totalTime / numSessions);

  for (let i = 0; i < numSessions; i++) {
    const sessionActivities = dynamicActivities.slice(i * 3, (i + 1) * 3);

    // Fallback if no specific activities
    if (sessionActivities.length === 0) {
      sessionActivities.push({ type: "practice", title: "General Review", duration: 10, completed: false });
    }

    sessions.push({
      id: `session_${i + 1}`,
      day: i + 1,
      title: `Mission Phase ${i + 1}: ${sessionActivities[0]?.title || "Operations"}`,
      objectives: [
        `Complete ${sessionActivities.length} tactical objectives`,
        `Master key spy skills`,
        `Report to headquarters`,
      ],
      activities: sessionActivities,
      estimatedTime: sessionActivities.reduce((acc, curr) => acc + curr.duration, 0),
      completed: false,
    });
  }

  return {
    id: `plan_${Date.now()}`,
    assignmentId: analysis.id,
    title: `Mission Plan: ${analysis.topics[0] || "English Operation"}`,
    sessions,
    createdAt: Date.now(),
    progress: 0,
  };
};

const StudyPlanGenerator_mod = ({ analysis, onStartSession, onBack, immersionMode = 'bilingual' }: StudyPlanGeneratorProps) => {
  const [plan] = useState<StudyPlan>(() => generateStudyPlan(analysis));
  const [expandedSession, setExpandedSession] = useState<string | null>(plan.sessions[0]?.id || null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "flashcards": return "🃏";
      case "practice": return "✏️";
      case "eval": return "📝";
      case "writing": return "✍️";
      case "reading": return "📖";
      default: return "📚";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">
            {immersionMode === 'standard' ? `Plan de Estudio para ${analysis.topics[0] || 'Práctica'}` : plan.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {plan.sessions.length} {immersionMode === 'standard' ? 'sesiones' : 'sessions'} • ~{analysis.estimatedTime} {immersionMode === 'standard' ? 'min total' : 'min total'}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-4 mb-4 border border-primary/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">
              {immersionMode === 'standard' ? 'Tu Horario de Estudio' : 'Your Study Schedule'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="w-4 h-4 text-warning" />
            <span>{plan.progress}% {immersionMode === 'standard' ? 'completado' : 'complete'}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {plan.sessions.map((session, i) => (
            <div
              key={session.id}
              className={`flex-1 h-2 rounded-full ${session.completed ? "bg-success" : i === 0 ? "bg-primary" : "bg-muted"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {plan.sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-card rounded-2xl border overflow-hidden ${expandedSession === session.id ? "border-primary" : "border-border"
              }`}
          >
            <button
              onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${session.completed
                ? "bg-success text-success-foreground"
                : index === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                }`}>
                {session.completed ? <CheckCircle2 className="w-5 h-5" /> : session.day}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">
                  {immersionMode === 'standard' ? `Sesión ${index + 1}` : session.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{session.estimatedTime} min</span>
                  <span>•</span>
                  <span>{session.activities.length} {immersionMode === 'standard' ? 'actividades' : 'activities'}</span>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${expandedSession === session.id ? "rotate-90" : ""
                }`} />
            </button>

            {expandedSession === session.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      {immersionMode === 'standard' ? 'Objetivos:' : 'Objectives:'}
                    </p>
                    <ul className="space-y-1">
                      {session.objectives.map((obj, i) => (
                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      {immersionMode === 'standard' ? 'Actividades:' : 'Activities:'}
                    </p>
                    <div className="space-y-2">
                      {session.activities.map((activity, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Create a temp session that prioritizes this activity type
                            // This ensures EnglishTutor_mod routes to the correct view immediately
                            const tempSession = {
                              ...session,
                              activities: [activity, ...session.activities.filter(a => a !== activity)]
                            };
                            onStartSession(tempSession, plan.id);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${activity.completed
                            ? "bg-success/10 border border-success/20"
                            : "bg-secondary/30 border border-transparent hover:bg-primary/10 hover:border-primary/20 hover:scale-[1.01]"
                            }`}
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">{getActivityIcon(activity.type)}</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                              {activity.title}
                              {!activity.completed && <PlayCircle className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.duration} min</p>
                          </div>
                          {activity.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => onStartSession(session, plan.id)}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {session.completed
                      ? (immersionMode === 'standard' ? 'Repasar Sesión' : 'Review Session')
                      : (immersionMode === 'standard' ? 'Comenzar Sesión' : 'Start Session')}
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlanGenerator_mod;
