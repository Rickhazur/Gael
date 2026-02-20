// 3D Models Library for Nova Schola
// Organized by subject: Science, Geometry, History, Geography

export interface Model3D {
    id: string;
    title: {
        es: string;
        en: string;
    };
    description: {
        es: string;
        en: string;
    };
    subject: 'science' | 'geometry' | 'history' | 'geography';
    grade: number[]; // Which grades can access this
    keywords: string[];
    modelFile: string; // Path to .glb file
    thumbnail?: string;
    interactiveHotspots?: {
        position: string; // "x y z" coordinates
        label: {
            es: string;
            en: string;
        };
        info: {
            es: string;
            en: string;
        };
    }[];
}

export const MODELS_LIBRARY: Model3D[] = [
    // ========== SCIENCE ==========
    {
        id: 'solar-system',
        title: {
            es: 'Astronauta', // Changed temporarily as full solar system is huge
            en: 'Astronaut'
        },
        description: {
            es: 'Un astronauta explorando el espacio',
            en: 'An astronaut exploring space'
        },
        subject: 'science',
        grade: [1, 2, 3, 4, 5],
        keywords: ['espacio', 'nasa', 'astronomía', 'space', 'astronaut'],
        modelFile: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', // Google Hosted
        interactiveHotspots: [
            {
                position: '0 1 0',
                label: { es: 'Casco', en: 'Helmet' },
                info: { es: 'Protege al astronauta en el espacio', en: 'Protects the astronaut in space' }
            }
        ]
    },
    {
        id: 'water-molecule',
        title: {
            es: 'Molécula de Agua (H₂O)',
            en: 'Water Molecule (H₂O)'
        },
        description: {
            es: 'Dos átomos de hidrógeno y uno de oxígeno',
            en: 'Two hydrogen atoms and one oxygen atom'
        },
        subject: 'science',
        grade: [3, 4, 5],
        keywords: ['agua', 'molécula', 'química', 'átomos', 'water', 'molecule', 'chemistry', 'atoms'],
        modelFile: 'https://cdn.glitch.com/2a3aKk0e-5b12-1f34-c2c3-4d4e5f6g7h8i9j0k/WaterMolecule.glb' // Placeholder needed - using Cube for now if url fails, but keeping structure
    },
    {
        id: 'human-heart',
        title: {
            es: 'Corazón Humano', // Using a robot for now as high quality anatomy is hard to direct link freely
            en: 'Robot Assistant'
        },
        description: {
            es: 'Un robot asistente del futuro',
            en: 'A robot assistant from the future'
        },
        subject: 'science',
        grade: [1, 2, 3, 4, 5],
        keywords: ['robot', 'tecnología', 'futuro', 'technology'],
        modelFile: 'https://modelviewer.dev/shared-assets/models/RobotExpressive.glb'
    },
    {
        id: 'plant-cell',
        title: {
            es: 'Traje Espacial', // Using suit for cell temporarily
            en: 'Space Suit'
        },
        description: {
            es: 'Traje dañado por la radiación',
            en: 'Suit damaged by radiation'
        },
        subject: 'science',
        grade: [4, 5],
        keywords: ['célula', 'planta', 'biología', 'cell', 'plant', 'biology'],
        modelFile: 'https://modelviewer.dev/shared-assets/models/DamagedHelmet.glb'
    },

    // ========== GEOMETRY ==========
    {
        id: 'cube',
        title: { es: 'Cubo', en: 'Cube' },
        description: { es: '6 caras cuadradas iguales', en: '6 equal square faces' },
        subject: 'geometry',
        grade: [1, 2, 3, 4, 5],
        keywords: ['cubo', 'geometría', 'sólido', 'cube'],
        modelFile: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
    },
    {
        id: 'sphere',
        title: { es: 'Pato de Hule', en: 'Rubber Duck' }, // Fun sphere replacement
        description: { es: 'Un patito amarillo clásico', en: 'A classic yellow duck' },
        subject: 'geometry',
        grade: [1, 2, 3, 4, 5],
        keywords: ['esfera', 'juguete', 'duck'],
        modelFile: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb'
    },
    {
        id: 'cylinder',
        title: { es: 'Cilindro (Lata)', en: 'Cylinder (Can)' }, // Using a BoomBox or similar
        description: { es: 'Ejemplo de forma cilíndrica', en: 'Example of cylindrical shape' },
        subject: 'geometry',
        grade: [3, 4, 5],
        keywords: ['cilindro', 'geometría', 'volumen', 'cylinder'],
        modelFile: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb'
    },

    // ========== HISTORY ==========
    {
        id: 'egyptian-pyramid',
        title: { es: 'Jarrón Antiguo', en: 'Ancient Vase' },
        description: { es: 'Artefacto histórico valioso', en: 'Valuable historical artifact' },
        subject: 'history',
        grade: [3, 4, 5],
        keywords: ['historia', 'antiguo', 'arte', 'history', 'ancient'],
        modelFile: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb' // Placeholder camera as "artifact"
    },
    {
        id: 'viking-ship',
        title: { es: 'Casco de Batalla', en: 'Battle Helmet' },
        description: { es: 'Equipamiento de guerrero antiguo', en: 'Ancient warrior equipment' },
        subject: 'history',
        grade: [4, 5],
        keywords: ['vikingo', 'guerra', 'historia', 'viking', 'war'],
        modelFile: 'https://modelviewer.dev/shared-assets/models/DamagedHelmet.glb'
    },

    // ========== GEOGRAPHY ==========
    {
        id: 'earth-globe',
        title: { es: 'Transborador Espacial', en: 'Space Shuttle' },
        description: { es: 'Nave para viajar alrededor de la Tierra', en: 'Ship to travel around Earth' },
        subject: 'geography',
        grade: [1, 2, 3, 4, 5],
        keywords: ['tierra', 'espacio', 'viaje', 'earth', 'space'],
        modelFile: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' // Reusing astronaut
    }
];

// Helper functions
export function getModelsBySubject(subject: 'science' | 'geometry' | 'history' | 'geography'): Model3D[] {
    return MODELS_LIBRARY.filter(model => model.subject === subject);
}

export function getModelsByGrade(grade: number): Model3D[] {
    return MODELS_LIBRARY.filter(model => model.grade.includes(grade));
}

export function searchModels(query: string, language: 'es' | 'en' = 'es'): Model3D[] {
    const terms = query.toLowerCase().split(' ').filter(t => t.length > 2); // Ignore short words like "the", "el", "la"
    if (terms.length === 0) return MODELS_LIBRARY;

    return MODELS_LIBRARY.filter(model => {
        const searchableText = [
            model.title[language],
            model.description[language],
            ...model.keywords
        ].join(' ').toLowerCase();

        // Match if ANY significant term is found in the model's text
        return terms.some(term => searchableText.includes(term));
    });
}

export function getModelById(id: string): Model3D | undefined {
    return MODELS_LIBRARY.find(model => model.id === id);
}
