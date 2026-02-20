/**
 * 📐 PROGRAMA COMPLETO DE GEOMETRÍA - QUINTO DE PRIMARIA
 * Sistema de conocimiento estructurado para el tutor de matemáticas
 */

export interface GeometryTopic {
    id: string;
    title: string;
    titleEn: string;
    category: string;
    concepts: GeometryConcept[];
    visualType: 'shape' | 'measurement' | 'transformation' | 'spatial';
}

export interface GeometryConcept {
    id: string;
    name: string;
    nameEn: string;
    definition: string;
    definitionEn: string;
    formula?: string;
    visualParams?: any;
    examples: string[];
    keywords: string[];
}

export const GEOMETRY_CURRICULUM: GeometryTopic[] = [
    // 1. FIGURAS GEOMÉTRICAS PLANAS
    {
        id: 'plane_figures',
        title: 'Figuras Geométricas Planas',
        titleEn: 'Plane Geometric Figures',
        category: 'Fundamentos',
        visualType: 'shape',
        concepts: [
            {
                id: 'point_line_segment',
                name: 'Punto, Recta y Segmento',
                nameEn: 'Point, Line and Segment',
                definition: 'El punto no tiene dimensión. La recta es infinita. El segmento tiene inicio y fin.',
                definitionEn: 'A point has no dimension. A line is infinite. A segment has a start and end.',
                keywords: ['punto', 'recta', 'segmento', 'point', 'line', 'segment'],
                examples: [
                    'Un punto es como una estrella en el cielo',
                    'Una recta es como un camino que nunca termina',
                    'Un segmento es como un lápiz con dos puntas'
                ]
            },
            {
                id: 'angles',
                name: 'Ángulos',
                nameEn: 'Angles',
                definition: 'Agudo (menor a 90°), Recto (90°), Obtuso (mayor a 90°)',
                definitionEn: 'Acute (less than 90°), Right (90°), Obtuse (greater than 90°)',
                keywords: ['ángulo', 'agudo', 'recto', 'obtuso', 'angle', 'acute', 'right', 'obtuse'],
                examples: [
                    'Ángulo agudo: como las manecillas del reloj a las 1:00',
                    'Ángulo recto: como la esquina de un libro',
                    'Ángulo obtuso: como las manecillas del reloj a las 10:00'
                ]
            },
            {
                id: 'triangles_by_sides',
                name: 'Triángulos según sus lados',
                nameEn: 'Triangles by sides',
                definition: 'Equilátero (3 lados iguales), Isósceles (2 lados iguales), Escaleno (todos diferentes)',
                definitionEn: 'Equilateral (3 equal sides), Isosceles (2 equal sides), Scalene (all different)',
                keywords: ['triángulo', 'equilátero', 'isósceles', 'escaleno', 'triangle', 'equilateral', 'isosceles', 'scalene'],
                examples: [
                    'Equilátero: como una señal de tránsito triangular',
                    'Isósceles: como un techo de casa',
                    'Escaleno: como una rebanada de pizza irregular'
                ]
            },
            {
                id: 'triangles_by_angles',
                name: 'Triángulos según sus ángulos',
                nameEn: 'Triangles by angles',
                definition: 'Acutángulo (3 ángulos agudos), Rectángulo (1 ángulo recto), Obtusángulo (1 ángulo obtuso)',
                definitionEn: 'Acute (3 acute angles), Right (1 right angle), Obtuse (1 obtuse angle)',
                keywords: ['acutángulo', 'rectángulo', 'obtusángulo', 'acute triangle', 'right triangle', 'obtuse triangle'],
                examples: [
                    'Acutángulo: todos los ángulos son menores a 90°',
                    'Rectángulo: tiene una esquina perfecta de 90°',
                    'Obtusángulo: tiene un ángulo "abierto" mayor a 90°'
                ]
            },
            {
                id: 'quadrilaterals',
                name: 'Cuadriláteros',
                nameEn: 'Quadrilaterals',
                definition: 'Cuadrado, Rectángulo, Rombo, Trapecio - figuras de 4 lados',
                definitionEn: 'Square, Rectangle, Rhombus, Trapezoid - 4-sided figures',
                keywords: ['cuadrado', 'rectángulo', 'rombo', 'trapecio', 'square', 'rectangle', 'rhombus', 'trapezoid'],
                examples: [
                    'Cuadrado: como una ventana perfecta',
                    'Rectángulo: como la pantalla de tu tablet',
                    'Rombo: como un diamante',
                    'Trapecio: como un tobogán visto de lado'
                ]
            },
            {
                id: 'polygons',
                name: 'Polígonos',
                nameEn: 'Polygons',
                definition: 'Figuras cerradas con muchos lados: pentágono (5), hexágono (6), octágono (8)',
                definitionEn: 'Closed figures with many sides: pentagon (5), hexagon (6), octagon (8)',
                keywords: ['polígono', 'pentágono', 'hexágono', 'octágono', 'polygon', 'pentagon', 'hexagon', 'octagon'],
                examples: [
                    'Pentágono: como el edificio del Pentágono en USA',
                    'Hexágono: como las celdas de un panal de abejas',
                    'Octágono: como una señal de PARE'
                ]
            }
        ]
    },

    // 2. PERÍMETRO
    {
        id: 'perimeter',
        title: 'Perímetro',
        titleEn: 'Perimeter',
        category: 'Medición',
        visualType: 'measurement',
        concepts: [
            {
                id: 'perimeter_concept',
                name: 'Concepto de Perímetro',
                nameEn: 'Perimeter Concept',
                definition: 'El perímetro es la suma de todos los lados de una figura. Es como medir el borde.',
                definitionEn: 'Perimeter is the sum of all sides of a figure. It\'s like measuring the edge.',
                keywords: ['perímetro', 'borde', 'contorno', 'perimeter', 'edge', 'outline'],
                examples: [
                    'Es como caminar alrededor de un parque',
                    'Es como poner una cerca alrededor de tu jardín',
                    'Es como medir el marco de un cuadro'
                ]
            },
            {
                id: 'triangle_perimeter',
                name: 'Perímetro del Triángulo',
                nameEn: 'Triangle Perimeter',
                definition: 'Suma de los tres lados',
                definitionEn: 'Sum of the three sides',
                formula: 'P = a + b + c',
                keywords: ['perímetro', 'triángulo', 'lados', 'perimeter', 'triangle', 'sides'],
                examples: [
                    'Si los lados miden 3, 4 y 5 cm, el perímetro es 12 cm',
                    'Triángulo equilátero de lado 6: P = 6 + 6 + 6 = 18'
                ]
            },
            {
                id: 'rectangle_perimeter',
                name: 'Perímetro del Rectángulo',
                nameEn: 'Rectangle Perimeter',
                definition: 'Dos veces el largo más dos veces el ancho',
                definitionEn: 'Two times length plus two times width',
                formula: 'P = 2(largo + ancho)',
                keywords: ['perímetro', 'rectángulo', 'largo', 'ancho', 'perimeter', 'rectangle', 'length', 'width'],
                examples: [
                    'Rectángulo de 8 cm × 5 cm: P = 2(8 + 5) = 26 cm',
                    'Cuadrado de lado 4: P = 2(4 + 4) = 16 cm'
                ]
            },
            {
                id: 'regular_polygon_perimeter',
                name: 'Perímetro de Polígonos Regulares',
                nameEn: 'Regular Polygon Perimeter',
                definition: 'Número de lados multiplicado por la longitud de un lado',
                definitionEn: 'Number of sides times the length of one side',
                formula: 'P = n × lado',
                keywords: ['perímetro', 'polígono', 'regular', 'perimeter', 'polygon', 'regular'],
                examples: [
                    'Hexágono regular de lado 3: P = 6 × 3 = 18 cm',
                    'Pentágono regular de lado 5: P = 5 × 5 = 25 cm'
                ]
            }
        ]
    },

    // 3. ÁREA
    {
        id: 'area',
        title: 'Área',
        titleEn: 'Area',
        category: 'Medición',
        visualType: 'measurement',
        concepts: [
            {
                id: 'area_concept',
                name: 'Concepto de Área',
                nameEn: 'Area Concept',
                definition: 'El área es el espacio que ocupa una figura. Se mide en unidades cuadradas.',
                definitionEn: 'Area is the space a figure occupies. It\'s measured in square units.',
                keywords: ['área', 'superficie', 'espacio', 'area', 'surface', 'space'],
                examples: [
                    'Es como contar cuántas baldosas caben en el piso',
                    'Es como medir cuánta pintura necesitas para una pared',
                    'Es como saber cuánto césped necesitas para un jardín'
                ]
            },
            {
                id: 'square_area',
                name: 'Área del Cuadrado',
                nameEn: 'Square Area',
                definition: 'Lado multiplicado por lado',
                definitionEn: 'Side times side',
                formula: 'A = lado²',
                keywords: ['área', 'cuadrado', 'lado', 'area', 'square', 'side'],
                examples: [
                    'Cuadrado de lado 5 cm: A = 5² = 25 cm²',
                    'Cuadrado de lado 10 m: A = 10² = 100 m²'
                ]
            },
            {
                id: 'rectangle_area',
                name: 'Área del Rectángulo',
                nameEn: 'Rectangle Area',
                definition: 'Largo multiplicado por ancho',
                definitionEn: 'Length times width',
                formula: 'A = largo × ancho',
                keywords: ['área', 'rectángulo', 'largo', 'ancho', 'area', 'rectangle', 'length', 'width'],
                examples: [
                    'Rectángulo de 8 cm × 5 cm: A = 8 × 5 = 40 cm²',
                    'Salón de 12 m × 8 m: A = 12 × 8 = 96 m²'
                ]
            },
            {
                id: 'triangle_area',
                name: 'Área del Triángulo',
                nameEn: 'Triangle Area',
                definition: 'Base por altura dividido entre dos',
                definitionEn: 'Base times height divided by two',
                formula: 'A = (base × altura) ÷ 2',
                keywords: ['área', 'triángulo', 'base', 'altura', 'area', 'triangle', 'base', 'height'],
                examples: [
                    'Triángulo con base 6 y altura 4: A = (6 × 4) ÷ 2 = 12 cm²',
                    'Triángulo con base 10 y altura 8: A = (10 × 8) ÷ 2 = 40 cm²'
                ]
            }
        ]
    },

    // 4. CUERPOS GEOMÉTRICOS
    {
        id: 'solid_figures',
        title: 'Cuerpos Geométricos',
        titleEn: 'Solid Figures',
        category: '3D',
        visualType: 'shape',
        concepts: [
            {
                id: 'cube',
                name: 'Cubo',
                nameEn: 'Cube',
                definition: '6 caras cuadradas, 12 aristas, 8 vértices',
                definitionEn: '6 square faces, 12 edges, 8 vertices',
                keywords: ['cubo', 'caras', 'aristas', 'vértices', 'cube', 'faces', 'edges', 'vertices'],
                visualParams: { faces: 6, edges: 12, vertices: 8 },
                examples: ['Dado', 'Cubo de Rubik', 'Caja cuadrada']
            },
            {
                id: 'rectangular_prism',
                name: 'Prisma Rectangular',
                nameEn: 'Rectangular Prism',
                definition: '6 caras rectangulares, 12 aristas, 8 vértices',
                definitionEn: '6 rectangular faces, 12 edges, 8 vertices',
                keywords: ['prisma', 'rectangular', 'caras', 'prism'],
                visualParams: { faces: 6, edges: 12, vertices: 8 },
                examples: ['Caja de zapatos', 'Libro', 'Ladrillo']
            },
            {
                id: 'pyramid',
                name: 'Pirámide',
                nameEn: 'Pyramid',
                definition: 'Base poligonal y caras triangulares que se unen en un vértice',
                definitionEn: 'Polygonal base and triangular faces meeting at a vertex',
                keywords: ['pirámide', 'base', 'vértice', 'pyramid', 'base', 'vertex'],
                examples: ['Pirámides de Egipto', 'Techo triangular', 'Montaña']
            },
            {
                id: 'cylinder',
                name: 'Cilindro',
                nameEn: 'Cylinder',
                definition: '2 bases circulares y una superficie curva',
                definitionEn: '2 circular bases and a curved surface',
                keywords: ['cilindro', 'circular', 'curva', 'cylinder', 'circular', 'curved'],
                examples: ['Lata de refresco', 'Rollo de papel', 'Tubo']
            },
            {
                id: 'cone',
                name: 'Cono',
                nameEn: 'Cone',
                definition: 'Base circular y superficie curva que termina en un punto',
                definitionEn: 'Circular base and curved surface ending in a point',
                keywords: ['cono', 'circular', 'punto', 'cone', 'circular', 'point'],
                examples: ['Cono de helado', 'Gorro de fiesta', 'Volcán']
            },
            {
                id: 'sphere',
                name: 'Esfera',
                nameEn: 'Sphere',
                definition: 'Superficie curva, todos los puntos equidistantes del centro',
                definitionEn: 'Curved surface, all points equidistant from center',
                keywords: ['esfera', 'curva', 'centro', 'sphere', 'curved', 'center'],
                examples: ['Pelota', 'Planeta Tierra', 'Burbuja']
            }
        ]
    },

    // 5. SIMETRÍA Y MOVIMIENTOS
    {
        id: 'symmetry_transformations',
        title: 'Simetría y Movimientos',
        titleEn: 'Symmetry and Transformations',
        category: 'Transformaciones',
        visualType: 'transformation',
        concepts: [
            {
                id: 'axial_symmetry',
                name: 'Simetría Axial',
                nameEn: 'Axial Symmetry',
                definition: 'Una figura es simétrica si al doblarla por un eje, ambas partes coinciden',
                definitionEn: 'A figure is symmetric if folding it along an axis makes both parts match',
                keywords: ['simetría', 'eje', 'espejo', 'symmetry', 'axis', 'mirror'],
                examples: [
                    'Una mariposa tiene simetría',
                    'Tu cara es casi simétrica',
                    'Un corazón tiene un eje de simetría'
                ]
            },
            {
                id: 'translation',
                name: 'Traslación',
                nameEn: 'Translation',
                definition: 'Mover una figura sin girarla ni cambiar su tamaño',
                definitionEn: 'Moving a figure without rotating or changing its size',
                keywords: ['traslación', 'mover', 'desplazar', 'translation', 'move', 'shift'],
                examples: [
                    'Como deslizar un libro sobre la mesa',
                    'Como mover una pieza de ajedrez',
                    'Como caminar en línea recta'
                ]
            },
            {
                id: 'rotation',
                name: 'Rotación',
                nameEn: 'Rotation',
                definition: 'Girar una figura alrededor de un punto',
                definitionEn: 'Rotating a figure around a point',
                keywords: ['rotación', 'girar', 'punto', 'rotation', 'rotate', 'point'],
                examples: [
                    'Como girar las manecillas del reloj',
                    'Como dar vueltas en una silla giratoria',
                    'Como rotar una rueda'
                ]
            }
        ]
    },

    // 6. SISTEMA DE REFERENCIA
    {
        id: 'coordinate_system',
        title: 'Sistema de Referencia y Planos',
        titleEn: 'Coordinate System and Planes',
        category: 'Ubicación',
        visualType: 'spatial',
        concepts: [
            {
                id: 'point_location',
                name: 'Ubicación de Puntos',
                nameEn: 'Point Location',
                definition: 'Usar coordenadas (x, y) para ubicar puntos en el plano',
                definitionEn: 'Using coordinates (x, y) to locate points on a plane',
                keywords: ['coordenadas', 'punto', 'plano', 'coordinates', 'point', 'plane'],
                examples: [
                    'Como encontrar un tesoro en un mapa',
                    'Como jugar batalla naval',
                    'Como ubicar tu casa en Google Maps'
                ]
            },
            {
                id: 'reading_maps',
                name: 'Lectura de Planos y Mapas',
                nameEn: 'Reading Plans and Maps',
                definition: 'Interpretar símbolos y ubicaciones en mapas simples',
                definitionEn: 'Interpreting symbols and locations on simple maps',
                keywords: ['mapa', 'plano', 'ubicación', 'map', 'plan', 'location'],
                examples: [
                    'Leer el mapa del zoológico',
                    'Encontrar tu salón en el plano de la escuela',
                    'Seguir un mapa del tesoro'
                ]
            }
        ]
    },

    // 7. MEDICIÓN
    {
        id: 'measurement',
        title: 'Medición',
        titleEn: 'Measurement',
        category: 'Herramientas',
        visualType: 'measurement',
        concepts: [
            {
                id: 'length_units',
                name: 'Unidades de Longitud',
                nameEn: 'Length Units',
                definition: 'Milímetro (mm), Centímetro (cm), Metro (m), Kilómetro (km)',
                definitionEn: 'Millimeter (mm), Centimeter (cm), Meter (m), Kilometer (km)',
                keywords: ['longitud', 'metro', 'centímetro', 'length', 'meter', 'centimeter'],
                examples: [
                    '1 cm = 10 mm',
                    '1 m = 100 cm',
                    '1 km = 1000 m'
                ]
            },
            {
                id: 'unit_conversion',
                name: 'Conversión de Unidades',
                nameEn: 'Unit Conversion',
                definition: 'Cambiar de una unidad a otra multiplicando o dividiendo',
                definitionEn: 'Changing from one unit to another by multiplying or dividing',
                keywords: ['conversión', 'unidades', 'multiplicar', 'conversion', 'units', 'multiply'],
                examples: [
                    '5 m = 500 cm',
                    '3000 mm = 3 m',
                    '2.5 km = 2500 m'
                ]
            },
            {
                id: 'measurement_tools',
                name: 'Herramientas de Medición',
                nameEn: 'Measurement Tools',
                definition: 'Regla, escuadra y transportador para medir longitudes y ángulos',
                definitionEn: 'Ruler, set square and protractor for measuring lengths and angles',
                keywords: ['regla', 'escuadra', 'transportador', 'ruler', 'square', 'protractor'],
                examples: [
                    'Regla: para medir líneas rectas',
                    'Escuadra: para hacer ángulos rectos',
                    'Transportador: para medir ángulos'
                ]
            }
        ]
    }
];

/**
 * Buscar conceptos relevantes según palabras clave
 */
export function findRelevantConcepts(text: string): GeometryConcept[] {
    const lowerText = text.toLowerCase();
    const matches: GeometryConcept[] = [];

    GEOMETRY_CURRICULUM.forEach(topic => {
        topic.concepts.forEach(concept => {
            const hasMatch = concept.keywords.some(keyword =>
                lowerText.includes(keyword.toLowerCase())
            );
            if (hasMatch) {
                matches.push(concept);
            }
        });
    });

    return matches;
}

/**
 * Obtener parámetros visuales para el whiteboard
 */
export function getVisualParams(conceptId: string): any {
    for (const topic of GEOMETRY_CURRICULUM) {
        const concept = topic.concepts.find(c => c.id === conceptId);
        if (concept) {
            return {
                shape: conceptId,
                labels: concept.formula ? [concept.formula] : [],
                highlightedLabels: [],
                ...concept.visualParams
            };
        }
    }
    return null;
}
