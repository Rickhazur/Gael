import React from 'react';
import { SimpleWordProblemSolver } from '@/components/WordProblems';

const TestWordProblemsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-4">
            🧠 Problemas Matemáticos - Método Socrático
          </h1>
          <p className="text-xl text-gray-600">
            Resuelve el problema paso a paso con Lina
          </p>
        </div>
        
        <SimpleWordProblemSolver 
          problem="Ana tenía 3/4 de litro de jugo. Luego bebió 2/5 de litro. ¿Cuántos litros de jugo bebió en total? ¿Cuánto jugo le quedó?"
        />
      </div>
    </div>
  );
};

export default TestWordProblemsPage;
