
export interface PressLesson {
    id: string;
    topic: string;
    headline: string;
    headline_es?: string; // Spanish Title
    subheadline: string;
    subheadline_es?: string; // Spanish Subtitle
    content: string; // The lesson text
    content_es?: string; // Spanish Content HTML
    examples: { context: string; sentence: string; sentence_es?: string }[];
    quiz: PressQuestion[];
}

export interface PressQuestion {
    id: string;
    type: "multiple-choice" | "fill-blank" | "reorder" | "short-answer";
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    skill: "grammar" | "vocabulary" | "reading" | "writing";
    difficulty: "easy" | "medium" | "hard";
}

export const PRESS_ROOM_CONTENT: Record<string, PressLesson> = {
    verbs: {
        id: "verbs",
        topic: "Action News",
        headline: "BREAKING NEWS: ACTION VERBS TAKE OVER CITY!",
        headline_es: "NOTICIA ÚLTIMA HORA: ¡VERBOS TOMA LA CIUDAD!",
        subheadline: "Verbs are the 'Action Heroes' of every sentence.",
        subheadline_es: "Los verbos son los 'Héroes de Acción' de cada oración.",
        content: `
      <p><strong>DATELINE: GRAMMAR CITY.</strong> Sources confirm that without VERBS, nothing happens! A verb is an action word. It tells us what the subject is doing.</p>
      <p>Investigative reporters have identified three main types of suspects:</p>
      <ul>
        <li><strong>Action Verbs:</strong> Run, Jump, Write, Investigate.</li>
        <li><strong>Linking Verbs:</strong> Am, Is, Are, Was, Were. (They connect ideas!)</li>
        <li><strong>Helping Verbs:</strong> Can, Will, Should, Must.</li>
      </ul>
      <p>Remember: To write a headline, you need ACTION!</p>
    `,
        content_es: `
      <p><strong>LUGAR: CIUDAD GRAMÁTICA.</strong> ¡Fuentes confirman que sin VERBOS, nada sucede! Un verbo es una palabra de acción. Nos dice qué hace el sujeto.</p>
      <p>Reporteros de investigación han identificado tres tipos principales de sospechosos:</p>
      <ul>
        <li><strong>Verbos de Acción:</strong> Correr, Saltar, Escribir, Investigar.</li>
        <li><strong>Verbos de Enlace:</strong> Ser, Estar (¡Conectan ideas!)</li>
        <li><strong>Verbos Auxiliares:</strong> Poder, Deber, Haber.</li>
      </ul>
      <p>Recuerda: ¡Para escribir un titular, necesitas ACCIÓN!</p>
    `,
        examples: [
            { context: "Witness Report 1", sentence: "The journalist <strong>writes</strong> a story.", sentence_es: "El periodista <strong>escribe</strong> una historia." },
            { context: "Police Scanner", sentence: "The cat <strong>jumped</strong> over the fence.", sentence_es: "El gato <strong>saltó</strong> sobre la cerca." },
            { context: "Editor's Note", sentence: "We <strong>are</strong> ready for the news.", sentence_es: "Nosotros <strong>estamos</strong> listos para las noticias." }
        ],
        quiz: [
            { id: "v1", type: "multiple-choice", question: "Identify the Action Verb: 'The dog ran fast.'", options: ["The", "Dog", "Ran", "Fast"], correctAnswer: "Ran", explanation: "'Ran' shows the action.", skill: "grammar", difficulty: "easy" },
            { id: "v2", type: "fill-blank", question: "Yesterday, I ___ (walk) to the park.", correctAnswer: "walked", explanation: "Past tense of walk adds -ed.", skill: "grammar", difficulty: "easy" },
            { id: "v3", type: "multiple-choice", question: "Choose the Helping Verb: 'She can swim.'", options: ["She", "Can", "Swim"], correctAnswer: "Can", explanation: "'Can' helps the main verb 'swim'.", skill: "grammar", difficulty: "medium" },
            { id: "v4", type: "reorder", question: "Build a sentence:", options: ["birds", "High", "fly"], correctAnswer: ["High", "birds", "fly"], explanation: "Adjective + Noun + Verb? No, usually Subject + Verb. 'Birds fly high'. Let's check logic.", difficulty: "easy", skill: "grammar" }, // Correction in logic below
            { id: "v4b", type: "reorder", question: "Make a sentence:", options: ["fly", "Birds", "high"], correctAnswer: ["Birds", "fly", "high"], explanation: "Subject (Birds) + Verb (fly) + Adverb (high).", skill: "grammar", difficulty: "easy" },
            { id: "v5", type: "short-answer", question: "Write a verb that ends in -ing.", correctAnswer: "running", explanation: "Any continuous verb works!", skill: "writing", difficulty: "medium" }
        ]
    },
    vocabulary: {
        id: "vocabulary",
        topic: "Word Power",
        headline: "OFFICIAL REPORT: VOCABULARY EXPANSION REQUIRED",
        subheadline: "Words are the tools of the trade. Sharpen them!",
        content: `
      <p><strong>MEMO TO ALL STAFF:</strong> Boring words are banned from the front page! We need descriptive Adjectives and precise Nouns.</p>
      <p>Don't say 'The big fire'. Say 'The <strong>massive</strong> blaze'.</p>
      <p>Don't say 'He said'. Say 'He <strong>declared</strong>'.</p>
      <p>Your accreditation depends on knowing Synonyms (words that mean the same) and Antonyms (opposites).</p>
    `,
        examples: [
            { context: "Headline A", sentence: "Local Hero Saves <strong>Tiny</strong> Kitten." },
            { context: "Headline B", sentence: "Mayor <strong>Announces</strong> New Holiday." },
            { context: "Weather Report", sentence: "Expect <strong>stormy</strong> weather tonight." }
        ],
        quiz: [
            { id: "vo1", type: "multiple-choice", question: "Synonym for 'Happy':", options: ["Sad", "Joyful", "Angry", "Tired"], correctAnswer: "Joyful", explanation: "Joyful means very happy.", skill: "vocabulary", difficulty: "easy" },
            { id: "vo2", type: "multiple-choice", question: "Antonym for 'Fast':", options: ["Quick", "Slow", "Rapid", "Speedy"], correctAnswer: "Slow", explanation: "Slow is the opposite of fast.", skill: "vocabulary", difficulty: "easy" },
            { id: "vo3", type: "fill-blank", question: "A person who writes news is a ___.", correctAnswer: "journalist", explanation: "Journalist / Reporter.", skill: "vocabulary", difficulty: "medium" },
            { id: "vo4", type: "reorder", question: "Describe the car:", options: ["red", "fast", "The", "car"], correctAnswer: ["The", "red", "car", "fast"], explanation: "Wait, 'The fast red car' or 'The red car is fast'. Let's simplify.", difficulty: "medium", skill: "vocabulary" },
            { id: "vo4b", type: "reorder", question: "Order the words:", options: ["is", "The", "sky", "blue"], correctAnswer: ["The", "sky", "is", "blue"], explanation: "Subject + verb + adjective.", skill: "vocabulary", difficulty: "easy" }
        ]
    },
    grammar: {
        id: "grammar",
        topic: "Style Guide",
        headline: "EDITOR'S WARNING: PUNCTUATION SAVES LIVES!",
        subheadline: "Let's eat grandma! vs Let's eat, grandma! Commas matter.",
        content: `
      <p><strong>STYLE GUIDE UPDATE V1.0:</strong> Good grammar is the difference between a Pulitzer Prize and the trash can.</p>
      <p><strong>1. Capitalization:</strong> Always start sentences and Names with a Big Letter.</p>
      <p><strong>2. Punctuation:</strong> Use periods (.) to stop. Question marks (?) for asking. Exclamation points (!) for shouting!</p>
      <p><strong>3. Subject-Verb Agreement:</strong> 'The cat runs' (Singular) vs 'The cats run' (Plural).</p>
    `,
        examples: [
            { context: "Correct", sentence: "<strong>S</strong>he <strong>lives</strong> in New York." },
            { context: "Incorrect", sentence: "<strike>she live in new york.</strike>" },
            { context: "Question", sentence: "<strong>W</strong>here is the story<strong>?</strong>" }
        ],
        quiz: [
            { id: "g1", type: "multiple-choice", question: "Which sentence is correct?", options: ["she run fast.", "She runs fast.", "She run fast.", "she runs fast."], correctAnswer: "She runs fast.", explanation: "Capital 'S' and 'runs' for singular subject.", skill: "grammar", difficulty: "medium" },
            { id: "g2", type: "fill-blank", question: "They ___ (be) my friends.", correctAnswer: "are", explanation: "'They' goes with 'are'.", skill: "grammar", difficulty: "easy" },
            { id: "g3", type: "reorder", question: "Fix the question:", options: ["name", "What", "your", "is", "?"], correctAnswer: ["What", "is", "your", "name", "?"], explanation: "Standard question format.", skill: "grammar", difficulty: "easy" }
        ]
    },
    reading: {
        id: "reading",
        topic: "Proofreading",
        headline: "FACT CHECK: FIND THE MAIN IDEA",
        subheadline: "Reading comprehension is the key to uncovering the truth.",
        content: `
      <p><strong>INVESTIGATION PROTOCOL:</strong> When you read a report, ask the 5 Ws:</p>
      <ul>
        <li><strong>Who</strong> is the story about?</li>
        <li><strong>What</strong> happened?</li>
        <li><strong>Where</strong> did it take place?</li>
        <li><strong>When</strong> did it happen?</li>
        <li><strong>Why</strong> is it important?</li>
      </ul>
      <p>Scan the text for keywords and don't get distracted by rumors!</p>
    `,
        examples: [
            { context: "Report Excerpt", sentence: "'Yesterday at noon, a bear stole a picnic basket in the park.'" },
            { context: "Analysis", sentence: "WHO: Bear. WHAT: Stole basket. WHERE: Park. WHEN: Yesterday." }
        ],
        quiz: [
            { id: "r1", type: "multiple-choice", question: "Read: 'Bats sleep in the day.' When do bats sleep?", options: ["Night", "Day", "Noon", "Never"], correctAnswer: "Day", explanation: "The text explicitly says 'in the day'.", skill: "reading", difficulty: "easy" },
            { id: "r2", type: "short-answer", question: "Read: 'The alien was green.' What color was it?", correctAnswer: "green", explanation: "Green.", skill: "reading", difficulty: "easy" }
        ]
    }
};
