# Módulo de Tutoría de Inglés Lúdica (EnglishTutor_mod)

## Descripción
Módulo de tutoría de inglés interactivo y lúdico para estudiantes de primaria (1º a 5º grado). Diseñado para detectar falencias en inglés analizando el trabajo del estudiante en otras materias y ofrecer enseñanza personalizada a través de juegos y conversación natural.

## Características Implementadas

### 1. Chat Interactivo con Tutor Mascota
- **Ollie el Búho**: Mascota animada que guía al estudiante
- Conversación natural con respuestas contextuales
- Feedback positivo y motivador
- Indicador de escritura animado

### 2. Detección de Falencias por Materia
- Panel de análisis que muestra rendimiento por materia (Ciencias, Historia, Matemáticas, Arte)
- Indicadores de tendencia (mejorando, estable, bajando)
- Lista de debilidades específicas detectadas en inglés
- Barras de progreso visuales

### 3. Mini-Juegos Integrados

#### Vocabulario
- Juego de selección múltiple
- Palabras relacionadas con las materias del estudiante
- Pistas para ayudar
- Sistema de puntos (+10 por respuesta correcta)
- Animaciones de celebración

#### Gramática
- Corrección de oraciones incorrectas
- Entrada de texto libre
- Sistema de pistas
- Explicación de reglas gramaticales
- Sistema de puntos (+15 por respuesta correcta)

### 4. Sistema de Gamificación
- **Puntos**: Acumulables por completar juegos
- **Racha**: Días consecutivos de práctica
- **Medallas**: Por logros en vocabulario, gramática, lectura, etc.
- Persistencia en localStorage

### 5. Diseño Visual Atractivo
- Colores vibrantes y amigables para niños
- Animaciones suaves con Framer Motion
- Emojis y stickers integrados
- Interfaz responsive (móvil y desktop)
- Tema claro optimizado para niños

## Estructura de Archivos

```
src/
├── components/
│   └── tutor_mod/
│       ├── TutorMascot.tsx      # Mascota animada del tutor
│       ├── ProgressBadges.tsx   # Sistema de puntos y medallas
│       ├── WeaknessDetector.tsx # Análisis de falencias por materia
│       ├── ChatInterface.tsx    # Interfaz de chat principal
│       ├── VocabularyGame.tsx   # Mini-juego de vocabulario
│       └── GrammarChallenge.tsx # Mini-juego de gramática
├── pages/
│   └── EnglishTutor_mod.tsx     # Página principal del módulo
```

## Alineación Curricular
- **IB PYP**: Enfoque en aprendizaje basado en indagación y conexiones interdisciplinarias
- **Currículo Colombiano**: Vocabulario y gramática apropiados para primaria

## Datos Guardados (localStorage)
- `englishTutorProgress_mod`: Puntos, racha y medallas del estudiante
- `englishTutorMessages_mod`: Historial de conversación

## Próximas Mejoras Sugeridas
1. Integración con backend para análisis real de textos de otras materias
2. Más variedad de mini-juegos (pronunciación, lectura)
3. Sistema de niveles por grado escolar
4. Reportes para padres/profesores
5. Sonidos y efectos de audio
6. Modo sin conexión

## Tecnologías Utilizadas
- React 18 + TypeScript
- Framer Motion (animaciones)
- Tailwind CSS (estilos)
- Lucide React (iconos)
- localStorage (persistencia local)
