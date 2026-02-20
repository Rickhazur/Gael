import React, { useState } from 'react';
import { Box, Circle, Triangle, Cylinder as CylinderIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Interactive3DViewer } from '../../3D/Interactive3DViewer';
import { getModelsBySubject, getModelById } from '../../3D/models-library';

interface GeometryVisualizerProps {
    language?: 'es' | 'en';
    currentGrade?: number;
}

export function GeometryVisualizer({ language = 'es', currentGrade = 3 }: GeometryVisualizerProps) {
    const [selectedShape, setSelectedShape] = useState<string | null>(null);
    const [showFormulas, setShowFormulas] = useState(false);

    const shapes = [
        {
            id: 'cube',
            name: { es: 'Cubo', en: 'Cube' },
            icon: Box,
            modelId: 'cube',
            formulas: {
                es: {
                    volume: 'Volumen = lado³',
                    surface: 'Área = 6 × lado²',
                    edges: '12 aristas',
                    vertices: '8 vértices',
                    faces: '6 caras'
                },
                en: {
                    volume: 'Volume = side³',
                    surface: 'Surface Area = 6 × side²',
                    edges: '12 edges',
                    vertices: '8 vertices',
                    faces: '6 faces'
                }
            },
            grade: [3, 4, 5]
        },
        {
            id: 'sphere',
            name: { es: 'Esfera', en: 'Sphere' },
            icon: Circle,
            modelId: 'sphere',
            formulas: {
                es: {
                    volume: 'Volumen = (4/3) × π × radio³',
                    surface: 'Área = 4 × π × radio²',
                    description: 'Perfectamente redonda en todas direcciones'
                },
                en: {
                    volume: 'Volume = (4/3) × π × radius³',
                    surface: 'Surface Area = 4 × π × radius²',
                    description: 'Perfectly round in all directions'
                }
            },
            grade: [4, 5]
        },
        {
            id: 'pyramid',
            name: { es: 'Pirámide', en: 'Pyramid' },
            icon: Triangle,
            modelId: 'pyramid',
            formulas: {
                es: {
                    volume: 'Volumen = (1/3) × base × altura',
                    surface: 'Área = base + áreas laterales',
                    faces: '5 caras (1 base + 4 triángulos)'
                },
                en: {
                    volume: 'Volume = (1/3) × base × height',
                    surface: 'Surface Area = base + lateral areas',
                    faces: '5 faces (1 base + 4 triangles)'
                }
            },
            grade: [4, 5]
        },
        {
            id: 'cylinder',
            name: { es: 'Cilindro', en: 'Cylinder' },
            icon: CylinderIcon,
            modelId: 'cylinder',
            formulas: {
                es: {
                    volume: 'Volumen = π × radio² × altura',
                    surface: 'Área = 2πr² + 2πrh',
                    description: 'Como una lata de refresco'
                },
                en: {
                    volume: 'Volume = π × radius² × height',
                    surface: 'Surface Area = 2πr² + 2πrh',
                    description: 'Like a soda can'
                }
            },
            grade: [4, 5]
        },
        {
            id: 'cone',
            name: { es: 'Cono', en: 'Cone' },
            icon: Triangle,
            modelId: 'cone',
            formulas: {
                es: {
                    volume: 'Volumen = (1/3) × π × radio² × altura',
                    surface: 'Área = πr² + πr × generatriz',
                    description: 'Como un cucurucho de helado'
                },
                en: {
                    volume: 'Volume = (1/3) × π × radius² × height',
                    surface: 'Surface Area = πr² + πr × slant height',
                    description: 'Like an ice cream cone'
                }
            },
            grade: [4, 5]
        },
        {
            id: 'rectangular-prism',
            name: { es: 'Prisma Rectangular', en: 'Rectangular Prism' },
            icon: Box,
            modelId: 'rectangular-prism',
            formulas: {
                es: {
                    volume: 'Volumen = largo × ancho × alto',
                    surface: 'Área = 2(lw + lh + wh)',
                    description: 'Como una caja de zapatos'
                },
                en: {
                    volume: 'Volume = length × width × height',
                    surface: 'Surface Area = 2(lw + lh + wh)',
                    description: 'Like a shoebox'
                }
            },
            grade: [3, 4, 5]
        }
    ];

    // Filter shapes by grade
    const availableShapes = shapes.filter(shape =>
        !currentGrade || shape.grade.includes(currentGrade)
    );

    console.log('🔍 GeometryVisualizer Debug:', {
        currentGrade,
        totalShapes: shapes.length,
        availableShapes: availableShapes.length,
        shapeNames: availableShapes.map(s => s.name.es)
    });

    const currentShape = shapes.find(s => s.id === selectedShape);

    if (selectedShape && currentShape) {
        return (
            <div className="space-y-6">
                {/* Back Button */}
                <Button
                    onClick={() => setSelectedShape(null)}
                    className="bg-slate-700 hover:bg-slate-600 text-white"
                >
                    ← {language === 'es' ? 'Volver a figuras' : 'Back to shapes'}
                </Button>

                {/* 3D Viewer */}
                <Interactive3DViewer
                    modelId={currentShape.modelId}
                    modelUrl={getModelById(currentShape.modelId)?.modelFile} // Pass URL from library!
                    title={currentShape.name[language]}
                    description={currentShape.formulas[language].description || ''}
                    subject="geometry"
                    language={language}
                />

                {/* Formulas Panel */}
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            📐 {language === 'es' ? 'Fórmulas' : 'Formulas'}
                        </h3>
                        <Button
                            onClick={() => setShowFormulas(!showFormulas)}
                            className="bg-blue-500/30 hover:bg-blue-500/50"
                        >
                            {showFormulas ? '👁️' : '👁️‍🗨️'}
                        </Button>
                    </div>

                    {showFormulas && (
                        <div className="space-y-4">
                            {Object.entries(currentShape.formulas[language]).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="bg-slate-900/50 rounded-xl p-4 border border-white/10"
                                >
                                    <p className="text-lg font-mono text-cyan-300">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showFormulas && (
                        <p className="text-white/60 text-center">
                            {language === 'es'
                                ? 'Haz clic en el ojo para ver las fórmulas'
                                : 'Click the eye to see formulas'}
                        </p>
                    )}
                </div>

                {/* Interactive Calculator (Future Enhancement) */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/30 rounded-3xl p-8">
                    <h3 className="text-2xl font-black text-white mb-4">
                        🧮 {language === 'es' ? 'Calculadora Interactiva' : 'Interactive Calculator'}
                    </h3>
                    <p className="text-white/60 text-center py-8">
                        {language === 'es'
                            ? '¡Próximamente! Podrás calcular volumen y área con valores personalizados.'
                            : 'Coming soon! You\'ll be able to calculate volume and area with custom values.'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">


            {/* Header */}
            <div className="text-center">
                <h2 className="text-4xl font-black text-white mb-3">
                    📐 {language === 'es' ? 'Geometría 3D' : '3D Geometry'}
                </h2>
                <p className="text-white/60 text-lg">
                    {language === 'es'
                        ? 'Explora figuras geométricas en 3D. En el móvil, usa AR para verlas en tu espacio.'
                        : 'Explore geometric shapes in 3D. On mobile, use AR to see them in your space.'}
                </p>
            </div>



            {/* Shapes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {availableShapes.map(shape => {
                    const Icon = shape.icon;
                    return (
                        <button
                            key={shape.id}
                            onClick={() => setSelectedShape(shape.id)}
                            className="group relative bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-400/30 rounded-3xl p-8 hover:scale-105 transition-all hover:shadow-[0_0_50px_rgba(59,130,246,0.4)]"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-20 h-20 bg-blue-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <Icon className="w-12 h-12 text-blue-300" />
                                </div>
                            </div>

                            {/* Name */}
                            <h3 className="text-xl font-black text-white text-center mb-2">
                                {shape.name[language]}
                            </h3>

                            {/* Grade Badge */}
                            <div className="flex justify-center">
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white/80">
                                    {language === 'es' ? 'Grados' : 'Grades'} {shape.grade.join(', ')}
                                </span>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                        </button>
                    );
                })}
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-400/20 rounded-3xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">💡</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-white mb-2">
                            {language === 'es' ? '¿Sabías que...?' : 'Did you know...?'}
                        </h4>
                        <p className="text-white/70">
                            {language === 'es'
                                ? 'Puedes rotar las figuras con el ratón (o dedo en móvil) para verlas desde todos los ángulos. ¡En el móvil, también puedes colocarlas en tu escritorio usando AR!'
                                : 'You can rotate shapes with your mouse (or finger on mobile) to see them from all angles. On mobile, you can also place them on your desk using AR!'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
