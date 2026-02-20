import { supabase } from './supabase';
import { ViewState } from '@/types';

export interface NativeMission {
    id: string;
    student_id: string;
    title: string;
    description: string;
    subject: 'MATH' | 'ENGLISH' | 'RESEARCH' | 'ART' | 'SCIENCE' | 'OTHER';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
    reward_coins: number;
    reward_xp: number;
    due_date: string;
    created_at: string;
    metadata?: any; // For flexible data like specific topic or page number
}

// Fetch missions from the 'missions' table
export const fetchNativeMissions = async (studentId: string) => {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('missions')
            .select('*')
            .eq('student_id', studentId)
            //.eq('status', 'AVAILABLE') // Fetch all non-archived? Or just active?
            .neq('status', 'ARCHIVED')
            .order('due_date', { ascending: true });

        if (error) {
            console.error('Error fetching native missions:', error);
            return [];
        }
        return data as NativeMission[];
    } catch (e) {
        console.error('Exception fetching native missions:', e);
        return [];
    }
};

// Create a new mission
export const createNativeMission = async (mission: Omit<NativeMission, 'id' | 'created_at'>) => {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('missions')
        .insert({
            student_id: mission.student_id,
            title: mission.title,
            description: mission.description,
            subject: mission.subject,
            difficulty: mission.difficulty,
            status: mission.status,
            reward_coins: mission.reward_coins,
            reward_xp: mission.reward_xp,
            due_date: mission.due_date,
            metadata: mission.metadata
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating mission:', error);
        throw error;
    }
    return data;
};

// Update mission status
export const updateMissionStatus = async (missionId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED') => {
    if (!supabase) return false;

    const updates: any = { status };
    if (status === 'COMPLETED') {
        updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', missionId);

    return !error;
};

// Generate Daily Missions (Rules-based for now, could be AI)
export const generateDailyMissions = async (studentId: string, gradeLevel: number) => {
    // 1. Check if missions already exist for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // This check is best done by the caller or a separate query to avoid spamming
    // For now, we return a list of Suggested Missions

    // Simple template based on grade
    const templates = [
        {
            title: 'Cálculo Mental Rápido',
            description: 'Practica 5 minutos de sumas y restas para calentar el cerebro.',
            subject: 'MATH',
            difficulty: 'EASY',
            reward_coins: 20,
            reward_xp: 50,
            metadata: { type: 'daily_drill' }
        },
        {
            title: 'Lectura Relámpago',
            description: 'Lee una página de tu libro favorito y resume lo que leíste.',
            subject: 'ENGLISH', // Or Language
            difficulty: 'MEDIUM',
            reward_coins: 30,
            reward_xp: 75,
            metadata: { type: 'reading_log' }
        },
        {
            title: 'Explorador Curioso',
            description: 'Investiga un dato curioso sobre un animal y cuéntaselo a Nova.',
            subject: 'RESEARCH',
            difficulty: 'EASY',
            reward_coins: 25,
            reward_xp: 60,
            metadata: { type: 'curiosity' }
        }
    ];

    const missions: Omit<NativeMission, 'id' | 'created_at'>[] = templates.map(t => ({
        student_id: studentId,
        title: t.title,
        description: t.description,
        subject: t.subject as any,
        difficulty: t.difficulty as any,
        status: 'AVAILABLE',
        reward_coins: t.reward_coins,
        reward_xp: t.reward_xp,
        due_date: new Date().toISOString(),
        metadata: t.metadata
    }));

    // Optionally save them immediately or return them to be saved
    return missions;
};

// Process Scanned Tasks -> Native Missions
export const convertScannedToMissions = async (studentId: string, scannedTasks: any[]) => {
    const missions: Omit<NativeMission, 'id' | 'created_at'>[] = scannedTasks.map(task => ({
        student_id: studentId,
        title: task.title,
        description: task.description || 'Tarea detectada automáticamente',
        subject: mapSubject(task.subject),
        difficulty: 'MEDIUM',
        status: 'AVAILABLE',
        reward_coins: 50, // Standard reward
        reward_xp: 100,
        due_date: calculateDueDate(task.estimated_due_days),
        metadata: { source: 'scan' }
    }));

    // Save all
    if (supabase) {
        const { data, error } = await supabase
            .from('missions')
            .insert(missions)
            .select();

        if (error) console.error("Error batch saving scanned missions", error);
        return data || [];
    }
    return [];
};

function mapSubject(rawSubject: string): any {
    const map: Record<string, string> = {
        'MATH': 'MATH',
        'ENGLISH': 'ENGLISH',
        'RESEARCH': 'RESEARCH',
        'ART': 'ART',
        'SCIENCE': 'SCIENCE'
    };
    return map[rawSubject] || 'OTHER';
}

function calculateDueDate(daysFromNow: number = 1): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString();
}
