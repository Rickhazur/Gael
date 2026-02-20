# 🍌 Proyecto Nano Banana Pro: La Revolución Móvil de Nova Schola

## 🎯 Objetivo
Transformar la experiencia móvil de Nova Schola Elementary en una "Super App" de bolsillo que no solo adapta el contenido, sino que reinventa la forma de interactuar con el aprendizaje.

> **Filosofía**: Si el alumno saca el celular, no es para sentarse a una clase larga. Es para ráfagas de genialidad, gamificación instantánea y acceso rápido.

---

## 📱 Concepto: "Nano Banana Pro" UX/UI

### 1. The NanoLaunch (Pantalla de Inicio)
Olvídate del Dashboard tradicional. En el celular, Nova Schola es una **Consola de Mando**.
- **Diseño**: Tarjetas verticales grandes, estilo TikTok/Instagram Stories para las "Misiones Diarias".
- **Fondo**: Animaciones sutiles (partículas "Nano") que reaccionan al giroscopio del celular.
- **Acceso Rápido**:
    - 🎮 **Arena Rápida**: Un botón flotante gigante para entrar a un duelo matemático de 60 segundos.
    - 🐾 **Pet Pocket**: Tu mascota siempre visible en una esquina, reaccionando a tus toques.

### 2. "Banana Bites" (Micro-Aprendizaje)
El contenido se reempaqueta para consumo móvil.
- **Formato**: Videos cortos (tipo Reels) generados por los Avatares AI.
- **Quiz Express**: Preguntas de "Deslizar a la derecha/izquierda" (Tinder-style) para responder Verdadero/Falso.
- **Streak Flame**: Fuego en la parte superior que crece con cada respuesta correcta consecutiva.

### 3. Navegación por Gestos
- **Shake to Reset**: ¿Te equivocaste en un cálculo? Agita el celular para borrar la pizarra.
- **Swipe entre materias**: Navega entre Matemáticas, Ciencias y Arte deslizando horizontalmente.

---

## 🛠️ Plan de Implementación Técnica

### Fase 1: El "Device Gate" (Inmediato)
- Modificación de `App.tsx` para detectar el dispositivo.
- Si es Escritorio -> Carga `MainLayout` (La experiencia inmersiva actual).
- Si es Móvil -> Carga `NanoBananaContainer` (La nueva experiencia nativa).

### Fase 2: Componentes Core (Nano Banana)
Crearemos una nueva estructura en `components/NanoBanana`:
- `NanoController.tsx`: El cerebro de la versión móvil.
- `NanoLaunchPad.tsx`: El menú principal estilo consola.
- `BananaBitesPlayer.tsx`: El reproductor de contenido vertical.

### Fase 3: Gamificación Hceitca (Táctil)
- Integración con Haptic Feedback (vibración) cuando ganas monedas.
- Animaciones CSS aceleradas por GPU para garantizar 60fps en móviles.

---

## 🌟 ¿Por qué "Pro"?
Porque aunque es "Nano" (pequeño/móvil), tiene el poder "Pro" de la IA de Nova funcionando en segundo plano, adaptando cada "Bite" al nivel del estudiante en tiempo real.
