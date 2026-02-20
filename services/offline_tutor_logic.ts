// 🧠 ADVANCED OFFLINE TUTOR (A1-B2 PEDAGOGY)
// Provides a "Simulated Fluidity" with context-aware branching across CEFR levels.

interface RachelleResponse {
    text: string;
    translation: string;
    suggestion: string;
    detected_level: string;
    sticker?: string;
    celebrate?: boolean;
    xp_gain?: number;
}

export function getOfflineTutorResponse(
    history: any[],
    userMessage: string,
    studentName: string = "Student"
): RachelleResponse {
    const lowerMsg = userMessage.toLowerCase().trim();
    const lastAssistantMsg = history
        .filter(m => m.role === 'assistant' || m.role === 'tutor')
        .pop()?.content?.toLowerCase() || "";

    // --- LEVEL B2: Hypothetical / Future (Abstract) ---
    if (lastAssistantMsg.includes("superpower") || lowerMsg.includes("superpower")) {
        return {
            text: "That is a very powerful choice! If you were a superhero, how would you use your power to help the world?",
            translation: "¡Esa es una elección muy poderosa! Si fueses un superhéroe, ¿cómo usarías tu poder para ayudar al mundo?",
            suggestion: "I would help people by...",
            detected_level: "B2",
            sticker: "🦸",
            xp_gain: 30
        };
    }

    // --- LEVEL B1: Experiences & Opinions ---
    if (lastAssistantMsg.includes("magic trick") || lowerMsg.includes("magic")) {
        return {
            text: "Imagine I can make your homework disappear! Just kidding. Do you think technology makes learning English easier or harder?",
            translation: "¿Te imaginas que pudiese hacer desaparecer tus deberes? Es broma. ¿Crees que la tecnología hace que aprender inglés sea más fácil o más difícil?",
            suggestion: "I think technology is...",
            detected_level: "B1",
            sticker: "💻",
            xp_gain: 25
        };
    }

    if (lastAssistantMsg.includes("favorite food") || lowerMsg.includes("food") || lowerMsg.includes("pizza") || lowerMsg.includes("comida")) {
        return {
            text: "Yummy! That sounds delicious. I love virtual pizza! If you could travel to any country to eat, where would you go?",
            translation: "¡Qué rico! Eso suena delicioso. ¡Amo la pizza virtual! Si pudieses viajar a cualquier país para comer, ¿a dónde irías?",
            suggestion: "I would go to Italy.",
            detected_level: "B1",
            sticker: "🍕",
            celebrate: true
        };
    }

    // --- LEVEL A2: Routines & Hobbies ---
    if (lastAssistantMsg.includes("play in the park") || lastAssistantMsg.includes("jugar en el parque") || lowerMsg.includes("park") || lowerMsg.includes("play")) {
        return {
            text: "The park is my favorite place too! What do you usually do on the weekends? Do you prefer playing sports or reading?",
            translation: "¡El parque también es mi lugar favorito! ¿Qué sueles hacer los fines de semana? ¿Prefieres hacer deporte o leer?",
            suggestion: "I prefer playing sports.",
            detected_level: "A2",
            sticker: "⚽",
            xp_gain: 15
        };
    }

    // --- LEVEL A1: Basics (Animals/Colors/Greetings) ---
    if (lastAssistantMsg.includes("pet at home") || lastAssistantMsg.includes("mascota en casa")) {
        if (lowerMsg.includes("no")) {
            return {
                text: "That is okay! Which animal is the most beautiful for you? A butterfly or a dolphin?",
                translation: "¡Está bien! ¿Qué animal es el más hermoso para ti? ¿Una mariposa o un delfín?",
                suggestion: "A dolphin is beautiful.",
                detected_level: "A1",
                sticker: "🐬"
            };
        }
        return {
            text: "How wonderful! I love animals so much. What is your pet's name? Does it like to play?",
            translation: "¡Qué maravilloso! Amo mucho a los animales. ¿Cómo se llama tu mascota? ¿Le gusta jugar?",
            suggestion: "Its name is...",
            detected_level: "A1",
            sticker: "🐶",
            celebrate: true
        };
    }

    if (lowerMsg.includes("pet's name") || lastAssistantMsg.includes("pet's name")) {
        return {
            text: "What a lovely name! I think you are a great friend to your pet. Do you like bigger animals like elephants?",
            translation: "¡Qué nombre tan encantador! Creo que eres un gran amigo para tu mascota. ¿Te gustan los animales más grandes como los elefantes?",
            suggestion: "Yes, I like elephants.",
            detected_level: "A1",
            sticker: "🐘"
        };
    }

    // --- TOPIC STARTERS (If no context matches) ---
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hola') || lowerMsg.includes('ready')) {
        return {
            text: `Hello ${studentName}! I am Rachelle. I am so excited to talk to you today. Are you ready to discover a secret about languages?`,
            translation: `¡Hola ${studentName}! Soy Rachelle. Estoy muy emocionada de hablar contigo hoy. ¿Estás listo para descubrir un secreto sobre los idiomas?`,
            suggestion: "Yes, tell me the secret!",
            detected_level: "A1",
            sticker: "🤫"
        };
    }

    if (lowerMsg.includes('secret') || lastAssistantMsg.includes('secret')) {
        return {
            text: "The secret is that English is like a game! Every word is a piece of the puzzle. What is your favorite color in English?",
            translation: "¡El secreto es que el inglés es como un juego! Cada palabra es una pieza del rompecabezas. ¿Cuál es tu color favorito en inglés?",
            suggestion: "My favorite color is...",
            detected_level: "A1",
            sticker: "🧩"
        };
    }

    if (lowerMsg.includes('color') || lowerMsg.includes('red') || lowerMsg.includes('blue') || lowerMsg.includes('green')) {
        return {
            text: "Beautiful colors! Did you know that cats can see colors differently? Speaking of animals, what is your favorite animal?",
            translation: "¡Hermosos colores! ¿Sabías que los gatos ven los colores de forma diferente? Hablando de animales, ¿cuál es tu animal favorito?",
            suggestion: "My favorite animal is...",
            detected_level: "A1",
            sticker: "🐱"
        };
    }

    // --- GENERIC FLUID FALLBACK (Curiosity Mode) ---
    const curiosities = [
        { t: "If you could have any superpower, which one would it be?", s: "I want to fly!", l: "B2", st: "⚡" },
        { t: "Which is your favorite season? Summer, Winter, Autumn or Spring?", s: "I love Summer!", l: "A2", st: "🌞" },
        { t: "Do you like to help your parents at home?", s: "Yes, I help them.", l: "A2", st: "🏠" },
        { t: "What do you want to be when you grow up? A doctor, an astronaut or an artist?", s: "I want to be an astronaut!", l: "B1", st: "🚀" }
    ];

    const randomCuriosity = curiosities[Math.floor(Math.random() * curiosities.length)];

    return {
        text: `You have a very good English level! Let's talk about this: ${randomCuriosity.t}`,
        translation: `¡Tienes un nivel de inglés muy bueno! Hablemos de esto: ${randomCuriosity.t}`,
        suggestion: randomCuriosity.s,
        detected_level: randomCuriosity.l,
        sticker: randomCuriosity.st,
        xp_gain: 10
    };
}
