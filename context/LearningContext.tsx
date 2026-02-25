import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Language } from '@/types';
import { TutorReport } from '@/types/tutor';
import { sampleTutorReports } from '@/lib/olliePersonality_mod';
import { supabase, saveTutorReport, fetchTutorReports } from '@/services/supabase';
import { sendWhatsAppTutorReport } from '@/services/whatsappReports';
import { sendEmailTutorReport } from '@/services/emailReports';



export type EnglishLevel = 'UNKNOWN' | 'A1' | 'A2' | 'B1' | 'B2';
export type SpanishLevel = 'SP1' | 'SP2' | 'SP3' | 'SP4' | 'SP5' | 'SP6' | 'SP7';

interface LearningContextType {
    reports: TutorReport[];
    addReport: (report: TutorReport) => void;
    getReportsBySource: (source: "math-tutor" | "research-center") => TutorReport | undefined;
    language: Language;
    setLanguage: (lang: Language) => void;
    immersionMode: 'bilingual' | 'standard';
    setImmersionMode: (mode: 'bilingual' | 'standard') => void;
    englishLevel: EnglishLevel;
    setEnglishLevel: (level: EnglishLevel) => void;
    spanishGrade: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    setSpanishGrade: (grade: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
    spanishLevel: SpanishLevel;
    setSpanishLevel: (level: SpanishLevel) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reports, setReports] = useState<TutorReport[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>('es');
    const [immersionMode, setImmersionMode] = useState<'bilingual' | 'standard'>('bilingual');
    const [englishLevel, setEnglishLevelState] = useState<EnglishLevel>('UNKNOWN');
    const [spanishGrade, setSpanishGradeState] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(3);
    const [spanishLevel, setSpanishLevelState] = useState<SpanishLevel>('SP3');

    // Initial load - try to get auth user & language
    useEffect(() => {
        // Load language
        const savedLang = localStorage.getItem('nova_language');
        if (savedLang === 'en' || savedLang === 'es') {
            setLanguage(savedLang);
        }

        // Immersion mode: synced from profile.is_bilingual when user loads (see checkUserAndLoad)
        const savedMode = localStorage.getItem('nova_immersion_mode');
        if (savedMode === 'bilingual' || savedMode === 'standard') {
            setImmersionMode(savedMode as any);
        }

        // English level (CEFR A1/A2) - used for scaffolding in BRIDGE mode
        const savedLevel = localStorage.getItem('nova_english_level');
        if (savedLevel === 'UNKNOWN' || savedLevel === 'A1' || savedLevel === 'A2' || savedLevel === 'B1' || savedLevel === 'B2') {
            setEnglishLevelState(savedLevel as any);
        }

        // Spanish grade and level - synced from profile or defaults
        const savedSpanishGrade = localStorage.getItem('nova_spanish_grade');
        if (savedSpanishGrade && ['1', '2', '3', '4', '5', '6', '7'].includes(savedSpanishGrade)) {
            const grade = parseInt(savedSpanishGrade, 10) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
            setSpanishGradeState(grade);
            // Map grade to level
            const levelMap: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, SpanishLevel> = {
                1: 'SP1',
                2: 'SP2',
                3: 'SP3',
                4: 'SP4',
                5: 'SP5',
                6: 'SP6',
                7: 'SP7'
            };
            setSpanishLevelState(levelMap[grade]);
        }

        const savedSpanishLevel = localStorage.getItem('nova_spanish_level');
        if (savedSpanishLevel && ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP7'].includes(savedSpanishLevel)) {
            setSpanishLevelState(savedSpanishLevel as SpanishLevel);
        }

        const checkUserAndLoad = async () => {
            const session = await supabase?.auth.getSession();
            if (session?.data.session?.user) {
                const uid = session.data.session.user.id;
                setUserId(uid);
                // Sync immersion mode from profile (bilingual school = parent chose at enrollment)
                try {
                    const response = await supabase
                        ?.from('profiles')
                        .select('is_bilingual')
                        .eq('id', uid)
                        .single();
                    if (response?.data && typeof response.data.is_bilingual === 'boolean') {
                        const mode = response.data.is_bilingual ? 'bilingual' : 'standard';
                        setImmersionMode(mode);
                        localStorage.setItem('nova_immersion_mode', mode);
                    }
                } catch (e) {
                    console.warn('Could not load immersion mode from profile', e);
                }
                const dbReports = await fetchTutorReports(uid);
                if (dbReports.length > 0) {
                    setReports(dbReports);
                    return;
                }
            }

            // Fallback to local if no DB data or offline
            const saved = localStorage.getItem('nova_tutor_reports');
            if (saved) {
                try {
                    setReports(JSON.parse(saved));
                } catch (e) { console.error("Error parsing local reports", e); }
            } else {
                setReports(sampleTutorReports);
            }
        };

        checkUserAndLoad();
    }, []);

    // Persist language on change
    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('nova_language', lang);
    };

    const handleSetImmersionMode = (mode: 'bilingual' | 'standard') => {
        setImmersionMode(mode);
        localStorage.setItem('nova_immersion_mode', mode);
    };

    const handleSetEnglishLevel = (level: EnglishLevel) => {
        setEnglishLevelState(level);
        localStorage.setItem('nova_english_level', level);
    };

    const handleSetSpanishGrade = (grade: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
        setSpanishGradeState(grade);
        localStorage.setItem('nova_spanish_grade', grade.toString());
        // Auto-sync level based on grade
        const levelMap: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, SpanishLevel> = {
            1: 'SP1',
            2: 'SP2',
            3: 'SP3',
            4: 'SP4',
            5: 'SP5',
            6: 'SP6',
            7: 'SP7'
        };
        setSpanishLevelState(levelMap[grade]);
        localStorage.setItem('nova_spanish_level', levelMap[grade]);
    };

    const handleSetSpanishLevel = (level: SpanishLevel) => {
        setSpanishLevelState(level);
        localStorage.setItem('nova_spanish_level', level);
        // Auto-sync grade based on level
        const gradeMap: Record<SpanishLevel, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
            'SP1': 1,
            'SP2': 2,
            'SP3': 3,
            'SP4': 4,
            'SP5': 5,
            'SP6': 6,
            'SP7': 7
        };
        setSpanishGradeState(gradeMap[level]);
        localStorage.setItem('nova_spanish_grade', gradeMap[level].toString());
    };

    const addReport = async (report: TutorReport) => {
        // Optimistic update
        setReports(prev => {
            const filtered = prev.filter(r => r.source !== report.source);
            const newReports = [...filtered, report];
            localStorage.setItem('nova_tutor_reports', JSON.stringify(newReports)); // Backup
            return newReports;
        });

        // Persist to DB
        if (userId) {
            await saveTutorReport(userId, report);
            // Trigger WhatsApp Report
            if (report.source === 'math-tutor' || report.source === 'research-center') {
                sendWhatsAppTutorReport(userId, report).catch(err => console.error("WS Error:", err));
                sendEmailTutorReport(userId, report).catch(err => console.error("Email Error:", err));
            }
        } else {
            // Try to get user again if not set
            const session = await supabase?.auth.getSession();
            if (session?.data.session?.user) {
                const uid = session.data.session.user.id;
                setUserId(uid);
                await saveTutorReport(uid, report);
                if (report.source === 'math-tutor' || report.source === 'research-center') {
                    sendWhatsAppTutorReport(uid, report).catch(err => console.error("WS Error:", err));
                    sendEmailTutorReport(uid, report).catch(err => console.error("Email Error:", err));
                }
            }
        }
    };


    const getReportsBySource = (source: "math-tutor" | "research-center") => {
        return reports.find(r => r.source === source);
    }

    return (
        <LearningContext.Provider value={{
            reports,
            addReport,
            getReportsBySource,
            language,
            setLanguage: handleSetLanguage,
            immersionMode,
            setImmersionMode: handleSetImmersionMode,
            englishLevel,
            setEnglishLevel: handleSetEnglishLevel,
            spanishGrade,
            setSpanishGrade: handleSetSpanishGrade,
            spanishLevel,
            setSpanishLevel: handleSetSpanishLevel
        }}>
            {children}
        </LearningContext.Provider>
    );
};

export const useLearning = () => {
    const context = useContext(LearningContext);
    if (context === undefined) {
        throw new Error('useLearning must be used within a LearningProvider');
    }
    return context;
};
