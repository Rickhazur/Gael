
export interface VocabularyItem {
    id: string;
    word: string;
    translation: string;
    category: string;
    example: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export const ENGLISH_VOCABULARY_CURRICULUM: Record<string, VocabularyItem[]> = {
    A1: [
        // COLORS
        { id: 'a1-c1', word: 'Red', translation: 'Rojo', category: 'Colors', example: 'The apple is red.', difficulty: 'easy' },
        { id: 'a1-c2', word: 'Blue', translation: 'Azul', category: 'Colors', example: 'The sky is blue.', difficulty: 'easy' },
        { id: 'a1-c3', word: 'Green', translation: 'Verde', category: 'Colors', example: 'The grass is green.', difficulty: 'easy' },
        { id: 'a1-c4', word: 'Yellow', translation: 'Amarillo', category: 'Colors', example: 'The sun is yellow.', difficulty: 'easy' },
        // ANIMALS
        { id: 'a1-a1', word: 'Dog', translation: 'Perro', category: 'Animals', example: 'I like my dog.', difficulty: 'easy' },
        { id: 'a1-a2', word: 'Cat', translation: 'Gato', category: 'Animals', example: 'The cat is small.', difficulty: 'easy' },
        { id: 'a1-a3', word: 'Fish', translation: 'Pez', category: 'Animals', example: 'The fish swims.', difficulty: 'easy' },
        { id: 'a1-a4', word: 'Bird', translation: 'Pájaro', category: 'Animals', example: 'The bird sings.', difficulty: 'easy' },
        // FAMILY
        { id: 'a1-f1', word: 'Mother', translation: 'Madre', category: 'Family', example: 'My mother is nice.', difficulty: 'easy' },
        { id: 'a1-f2', word: 'Father', translation: 'Padre', category: 'Family', example: 'My father is tall.', difficulty: 'easy' },
        { id: 'a1-f3', word: 'Sister', translation: 'Hermana', category: 'Family', example: 'She is my sister.', difficulty: 'easy' },
        { id: 'a1-f4', word: 'Brother', translation: 'Hermano', category: 'Family', example: 'He is my brother.', difficulty: 'easy' },
        // SCHOOL
        { id: 'a1-s1', word: 'Book', translation: 'Libro', category: 'School', example: 'Open your book.', difficulty: 'easy' },
        { id: 'a1-s2', word: 'Pen', translation: 'Bolígrafo', category: 'School', example: 'This is my pen.', difficulty: 'easy' },
        { id: 'a1-s3', word: 'Teacher', translation: 'Maestro', category: 'School', example: 'Listen to the teacher.', difficulty: 'medium' },
        { id: 'a1-s4', word: 'Pencil', translation: 'Lápiz', category: 'School', example: 'I write with a pencil.', difficulty: 'easy' },
        // NUMBERS
        { id: 'a1-n1', word: 'One', translation: 'Uno', category: 'Numbers', example: 'I have one nose.', difficulty: 'easy' },
        { id: 'a1-n2', word: 'Two', translation: 'Dos', category: 'Numbers', example: 'I have two eyes.', difficulty: 'easy' },
        { id: 'a1-n3', word: 'Three', translation: 'Tres', category: 'Numbers', example: 'Three small pigs.', difficulty: 'easy' },
    ],
    A2: [
        // FOOD
        { id: 'a2-fo1', word: 'Breakfast', translation: 'Desayuno', category: 'Food', example: 'I eat breakfast at 7.', difficulty: 'medium' },
        { id: 'a2-fo2', word: 'Lunch', translation: 'Almuerzo', category: 'Food', example: 'Lunch is at school.', difficulty: 'medium' },
        { id: 'a2-fo3', word: 'Dinner', translation: 'Cena', category: 'Food', example: 'We have dinner together.', difficulty: 'medium' },
        { id: 'a2-fo4', word: 'Bread', translation: 'Pan', category: 'Food', example: 'I like bread.', difficulty: 'easy' },
        // ROUTINE
        { id: 'a2-r1', word: 'Wake up', translation: 'Despertarse', category: 'Routine', example: 'I wake up early.', difficulty: 'medium' },
        { id: 'a2-r2', word: 'Go to sleep', translation: 'Dormirse', category: 'Routine', example: 'I go to sleep late.', difficulty: 'medium' },
        { id: 'a2-r3', word: 'Brush teeth', translation: 'Cepillar dientes', category: 'Routine', example: 'Brush your teeth well.', difficulty: 'medium' },
        // CLOTHES
        { id: 'a2-c1', word: 'Shirt', translation: 'Camisa', category: 'Clothes', example: 'My shirt is red.', difficulty: 'easy' },
        { id: 'a2-c2', word: 'Shoes', translation: 'Zapatos', category: 'Clothes', example: 'Put on your shoes.', difficulty: 'easy' },
        { id: 'a2-c3', word: 'Coat', translation: 'Abrigo', category: 'Clothes', example: 'It is cold, wear a coat.', difficulty: 'medium' },
        // WEATHER
        { id: 'a2-w1', word: 'Rainy', translation: 'Lluvioso', category: 'Weather', example: 'It is rainy today.', difficulty: 'medium' },
        { id: 'a2-w2', word: 'Sunny', translation: 'Soleado', category: 'Weather', example: 'I like sunny days.', difficulty: 'medium' },
    ],
    B1: [
        // TRAVEL
        { id: 'b1-t1', word: 'Airport', translation: 'Aeropuerto', category: 'Travel', example: 'We went to the airport.', difficulty: 'medium' },
        { id: 'b1-t2', word: 'Ticket', translation: 'Billete', category: 'Travel', example: 'Where is my ticket?', difficulty: 'easy' },
        { id: 'b1-t3', word: 'Passport', translation: 'Pasaporte', category: 'Travel', example: 'Show me your passport.', difficulty: 'medium' },
        // TECHNOLOGY
        { id: 'b1-tec1', word: 'Computer', translation: 'Ordenador', category: 'Technology', example: 'I use a computer for homework.', difficulty: 'medium' },
        { id: 'b1-tec2', word: 'Screen', translation: 'Pantalla', category: 'Technology', example: 'The screen is bright.', difficulty: 'medium' },
        { id: 'b1-tec3', word: 'Keyboard', translation: 'Teclado', category: 'Technology', example: 'Type on the keyboard.', difficulty: 'hard' },
        // HEALTH
        { id: 'b1-h1', word: 'Headache', translation: 'Dolor de cabeza', category: 'Health', example: 'I have a bad headache.', difficulty: 'hard' },
        { id: 'b1-h2', word: 'Vegetables', translation: 'Verduras', category: 'Health', example: 'Vegetables are healthy.', difficulty: 'medium' },
    ],
    B2: [
        // OPINIONS
        { id: 'b2-o1', word: 'Believe', translation: 'Creer', category: 'Opinions', example: 'I believe we can do it.', difficulty: 'medium' },
        { id: 'b2-o2', word: 'Agree', translation: 'Estar de acuerdo', category: 'Opinions', example: 'I agree with you.', difficulty: 'medium' },
        { id: 'b2-o3', word: 'Arguments', translation: 'Argumentos', category: 'Opinions', example: 'His arguments were strong.', difficulty: 'hard' },
        // ENVIRONMENT
        { id: 'b2-e1', word: 'Pollution', translation: 'Contaminación', category: 'Environment', example: 'Pollution is a big problem.', difficulty: 'hard' },
        { id: 'b2-e2', word: 'Recycle', translation: 'Reciclar', category: 'Environment', example: 'We should recycle plastic.', difficulty: 'medium' },
        { id: 'b2-e3', word: 'Climate Change', translation: 'Cambio climático', category: 'Environment', example: 'Climate change affects us all.', difficulty: 'hard' },
        // WORK
        { id: 'b2-w1', word: 'Interview', translation: 'Entrevista', category: 'Work', example: 'Good luck on your interview.', difficulty: 'medium' },
        { id: 'b2-w2', word: 'Career', translation: 'Carrera', category: 'Work', example: 'She has a great career.', difficulty: 'hard' },
    ]
};

export const getAllVocabulary = () => {
    return [
        ...ENGLISH_VOCABULARY_CURRICULUM.A1,
        ...ENGLISH_VOCABULARY_CURRICULUM.A2,
        ...ENGLISH_VOCABULARY_CURRICULUM.B1,
        ...ENGLISH_VOCABULARY_CURRICULUM.B2,
    ];
};
