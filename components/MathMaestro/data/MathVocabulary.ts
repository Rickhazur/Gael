export interface MathTerm {
    term: string;
    spanish: string;
    definition: string;
    example: string;
}

export interface GradeVocabulary {
    grade: number;
    topics: {
        topicName: string;
        terms: MathTerm[];
    }[];
}

export const MATH_VOCABULARY: GradeVocabulary[] = [
    {
        grade: 1,
        topics: [
            {
                topicName: "Numbers & Counting / Números y Conteo",
                terms: [
                    { term: "Count", spanish: "Contar", definition: "To say numbers in order.", example: "Let's count to 10." },
                    { term: "Add", spanish: "Sumar", definition: "To put numbers together.", example: "2 plus 2 is 4." },
                    { term: "Subtract", spanish: "Restar", definition: "To take away.", example: "5 minus 2 is 3." },
                    { term: "Equals", spanish: "Igual a", definition: "The same as.", example: "2 + 2 equals 4." },
                    { term: "More", spanish: "Más", definition: "A larger amount.", example: "5 is more than 3." },
                    { term: "Less", spanish: "Menos", definition: "A smaller amount.", example: "2 is less than 4." }
                ]
            },
            {
                topicName: "Shapes / Figuras",
                terms: [
                    { term: "Circle", spanish: "Círculo", definition: "A round shape.", example: "The sun is a circle." },
                    { term: "Square", spanish: "Cuadrado", definition: "A shape with 4 equal sides.", example: "A box is a square." },
                    { term: "Triangle", spanish: "Triángulo", definition: "A shape with 3 sides.", example: "A slice of pizza is a triangle." }
                ]
            }
        ]
    },
    {
        grade: 2,
        topics: [
            {
                topicName: "Place Value / Valor Posicional",
                terms: [
                    { term: "Ones", spanish: "Unidades", definition: "Numbers 0-9.", example: "In 12, 2 is in the ones place." },
                    { term: "Tens", spanish: "Decenas", definition: "Groups of 10.", example: "In 12, 1 is in the tens place." },
                    { term: "Hundreds", spanish: "Centenas", definition: "Groups of 100.", example: "100, 200, 300." }
                ]
            },
            {
                topicName: "Addition & Subtraction",
                terms: [
                    { term: "Sum", spanish: "Suma total", definition: "The answer to addition.", example: "The sum of 2 and 3 is 5." },
                    { term: "Difference", spanish: "Diferencia", definition: "The answer to subtraction.", example: "The difference between 5 and 3 is 2." },
                    { term: "Regroup", spanish: "Reagrupar (llevar)", definition: "Carrying over numbers.", example: "Regroup 10 ones as 1 ten." }
                ]
            }
        ]
    },
    {
        grade: 3,
        topics: [
            {
                topicName: "Multiplication & Division",
                terms: [
                    { term: "Multiply", spanish: "Multiplicar", definition: "Adding groups repeatedly.", example: "3 times 4." },
                    { term: "Product", spanish: "Producto", definition: "The answer to multiplication.", example: "The product of 3 and 4 is 12." },
                    { term: "Divide", spanish: "Dividir", definition: "Sharing exactly equally.", example: "Share 12 cookies among 4 friends." },
                    { term: "Quotient", spanish: "Cociente", definition: "The answer to division.", example: "12 divided by 4 is 3." }
                ]
            },
            {
                topicName: "Fractions / Fracciones",
                terms: [
                    { term: "Fraction", spanish: "Fracción", definition: "Part of a whole.", example: "1/2 is a fraction." },
                    { term: "Numerator", spanish: "Numerador", definition: "Top number (parts we have).", example: "In 1/2, 1 is the numerator." },
                    { term: "Denominator", spanish: "Denominador", definition: "Bottom number (total parts).", example: "In 1/2, 2 is the denominator." }
                ]
            }
        ]
    },
    {
        grade: 4,
        topics: [
            {
                topicName: "Decimals / Decimales",
                terms: [
                    { term: "Decimal", spanish: "Decimal", definition: "A number with a point.", example: "0.5 is a decimal." },
                    { term: "Tenths", spanish: "Décimas", definition: "First spot after point.", example: "0.1" },
                    { term: "Hundredths", spanish: "Centésimas", definition: "Second spot after point.", example: "0.01" }
                ]
            },
            {
                topicName: "Geometry / Geometría",
                terms: [
                    { term: "Angle", spanish: "Ángulo", definition: "Corner where lines meet.", example: "A square has 4 angles." },
                    { term: "Right Angle", spanish: "Ángulo Recto", definition: "A 90 degree corner.", example: "Like a book corner." },
                    { term: "Parallel", spanish: "Paralelo", definition: "Lines that never touch.", example: "Train tracks." },
                    { term: "Perpendicular", spanish: "Perpendicular", definition: "Lines crossing at right angles.", example: "A cross shape." }
                ]
            }
        ]
    },
    {
        grade: 5,
        topics: [
            {
                topicName: "Advanced Fractions / Fracciones Avanzadas",
                terms: [
                    { term: "Simplify", spanish: "Simplificar", definition: "Make numbers smaller.", example: "2/4 becomes 1/2." },
                    { term: "Mixed Number", spanish: "Número Mixto", definition: "Whole number plus fraction.", example: "1 and 1/2." },
                    { term: "Improper Fraction", spanish: "Fracción Impropia", definition: "Top is bigger than bottom.", example: "3/2" }
                ]
            },
            {
                topicName: "Volume / Volumen",
                terms: [
                    { term: "Volume", spanish: "Volumen", definition: "Space inside a 3D shape.", example: "How much water fits in a cup." },
                    { term: "Cubic Units", spanish: "Unidades Cúbicas", definition: "Blocks to measure volume.", example: "cm³" }
                ]
            }
        ]
    }
];
