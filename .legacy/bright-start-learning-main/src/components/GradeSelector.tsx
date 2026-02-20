import { useState } from 'react';

const grades = ['1°', '2°', '3°', '4°', '5°'];

const GradeSelector = () => {
  const [selectedGrade, setSelectedGrade] = useState('3°');

  return (
    <div className="flex flex-col items-center gap-3 mb-10 opacity-0 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <span className="text-sm font-medium text-muted-foreground">Selecciona tu grado:</span>
      <div className="flex gap-2 bg-card p-1.5 rounded-2xl shadow-soft border border-border/50">
        {grades.map((grade) => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              selectedGrade === grade
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {grade} Grado
          </button>
        ))}
      </div>
    </div>
  );
};

export default GradeSelector;
