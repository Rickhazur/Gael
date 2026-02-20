import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MATH_VOCABULARY, GradeVocabulary, MathTerm } from '../data/MathVocabulary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Volume2 } from 'lucide-react';
import { generateSpeech } from '@/services/edgeTTS';

export function VocabularyModal() {
    const [selectedGrade, setSelectedGrade] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState("");

    const playAudio = async (text: string) => {
        try {
            await generateSpeech(text, 'rachelle');
        } catch (error) {
            console.error("Audio playback failed", error);
        }
    };

    const currentGradeData = MATH_VOCABULARY.find(g => g.grade === selectedGrade);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded-full bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-sm gap-2"
                >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Dictionary</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 bg-slate-50 gap-0">
                <DialogHeader className="p-6 bg-white border-b border-slate-100 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-2xl text-indigo-900">
                        <span className="text-3xl">📚</span> Math Vocabulary / Glosario
                    </DialogTitle>
                    <p className="text-slate-500 mt-2">
                        Learn the magic words of mathematics in English! / ¡Aprende las palabras mágicas!
                    </p>
                </DialogHeader>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Grades */}
                    <div className="w-48 bg-white border-r border-slate-200 p-4 flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grades / Grados</label>
                        {[1, 2, 3, 4, 5, 6, 7].map(g => (
                            <Button
                                key={g}
                                variant={selectedGrade === g ? "default" : "ghost"}
                                onClick={() => setSelectedGrade(g)}
                                className={`justify-start text-lg h-12 ${selectedGrade === g ? 'bg-indigo-600' : 'text-slate-600'}`}
                            >
                                Grade {g}
                            </Button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-slate-50">
                        {/* Search Bar */}
                        <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-2">
                            <Search className="w-5 h-5 text-slate-400" />
                            <input
                                className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400"
                                placeholder="Search word..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                                {currentGradeData?.topics.map((topic, i) => (
                                    <div key={i} className="space-y-4">
                                        <h3 className="font-bold text-indigo-600 text-lg border-b-2 border-indigo-100 pb-2 mb-4">
                                            {topic.topicName}
                                        </h3>
                                        <div className="space-y-3">
                                            {topic.terms
                                                .filter(t => t.term.toLowerCase().includes(searchTerm.toLowerCase()) || t.spanish.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map((term, j) => (
                                                    <div key={j} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-slate-800 text-xl">{term.term}</h4>
                                                                <span className="text-sm font-medium text-emerald-600 italic">{term.spanish}</span>
                                                            </div>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                                                                onClick={() => playAudio(term.term)}
                                                            >
                                                                <Volume2 className="w-5 h-5" />
                                                            </Button>
                                                        </div>
                                                        <p className="text-slate-600 text-sm mb-2">{term.definition}</p>
                                                        <div className="bg-indigo-50 p-2 rounded-lg text-xs text-indigo-700 border border-indigo-100">
                                                            <strong>Ex:</strong> {term.example}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
