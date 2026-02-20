# 🎮 Sistema de Avatares y Gamificación - Documentación Completa

**Fecha:** 2026-01-04  
**Versión:** 2.0.0

---

## 📊 **ARQUITECTURA DEL SISTEMA**

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO ESTUDIANTE                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              1. SELECCIÓN DE AVATAR BASE                     │
│  - 40+ avatares organizados por grado (1°-5°)               │
│  - 8 avatares por grado (4 niños + 4 niñas)                │
│  - Avatar base SIN accesorios                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              2. SISTEMA DE COINS (Nova Coins)                │
│  - Balance inicial: 100 coins                                │
│  - Ganar coins: Completar misiones, tareas, quests          │
│  - Gastar coins: Comprar accesorios en Tienda Nova          │
│  - Persistencia: Supabase tabla `economy`                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              3. TIENDA NOVA (Avatar Shop)                    │
│  - 30+ accesorios disponibles                                │
│  - Categorías: head, face, torso, back, pet, effect, hand   │
│  - Rareza: common, rare, epic, legendary                     │
│  - Condiciones: none, level, coins_earned, mission, event   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              4. PERSONALIZACIÓN DE AVATAR                    │
│  - Equipar/desequipar accesorios comprados                   │
│  - Cambiar avatar base (conservando accesorios)              │
│  - Preview en tiempo real                                    │
│  - Persistencia: Supabase tabla `profiles`                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              5. VISUALIZACIÓN EN MÓDULOS                     │
│  - Dashboard: Avatar con accesorios equipados                │
│  - Arena: Avatar en misiones                                 │
│  - Math Maestro: Avatar como compañero                       │
│  - Todos los módulos: Sincronización automática              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ **ESTRUCTURA DE DATOS**

### **1. Avatares Base (40+ personajes)**

**Ubicación:** `components/Gamification/data/avatars.ts`

```typescript
// Estructura de un avatar
interface Avatar {
    id: string;              // Ej: 'g4_astro'
    name: string;            // Ej: 'Astro-Explorer'
    description: string;     // Descripción corta
    personality: string;     // Personalidad del avatar
    colors: string[];        // Colores principales
    style: string;           // Estilo visual
    baseImage: string;       // Ruta a la imagen base SIN accesorios
}

// Organización por grado
AVATARS_GRADE_1: Avatar[]  // 1° Primaria (8 avatares)
AVATARS_GRADE_2: Avatar[]  // 2° Primaria (8 avatares)
AVATARS_GRADE_3: Avatar[]  // 3° Primaria (8 avatares)
AVATARS_GRADE_4: Avatar[]  // 4° Primaria (6 avatares)
AVATARS_GRADE_5: Avatar[]  // 5° Primaria (6 avatares)
```

**Ejemplos por grado:**

**1° Grado (Fantasy Animals & Cute Heroes):**
- Super Conejo (Enérgico)
- Dino Rex (Valiente)
- Princesa Hada (Amable)
- Caballero Mini (Noble)
- Gato Mágico (Astuto)
- Robo-Amigo (Inteligente)
- Chica Maravilla (Fuerte)
- Chico Rayo (Veloz)

**2° Grado (Adventure & Nature):**
- Exploradora de la Selva (Curiosa)
- Explorador del Desierto (Aventurero)
- Sirena del Mar (Protectora)
- Pirata Valiente (Temerario)
- Hada del Bosque (Dulce)
- Elfo Arquero (Certero)
- Doctora Juguetes (Cuidadosa)
- Constructor Maestro (Creativo)

**3° Grado (Fantasy Classes & Cool Kids):**
- Aprendiz de Mago (Sabio)
- Brujita Estelar (Misteriosa)
- Skater Pro (Radical)
- Roller King (Veloz)
- Detective Joven (Analítico)
- Mini Ninja (Sigiloso)
- Artista Colorida (Expresiva)
- Estrella de Rock (Ruidoso)

**4° Grado (Modern & Tech):**
- Astro-Explorer (Curioso y Valiente)
- Pixel Paladin (Leal y Fuerte)
- Street Stylist (Creativa y Audaz)
- Tech Savvy (Inteligente y Práctico)
- Anime Ace (Disciplinada y Veloz)
- Gamer Guru (Competitivo y Estratega)

**5° Grado (Futuristic & Advanced):**
- Explorador Astral (Visionario)
- Maga Digital (Mística y Lógica)
- Guerrero Sintético (Imparable)
- Shadow Ninja (Invisible)
- Tech Visionary (Genio)
- Cyber Mage (Poderoso)

---

### **2. Accesorios (30+ items)**

**Ubicación:** `components/Gamification/data/avatars.ts`

```typescript
interface Accessory {
    id: string;                    // Ej: 'acc_visor'
    name: string;                  // Ej: 'Visor Tech'
    type: AccessoryType;           // head, face, torso, back, pet, effect, hand
    rarity: Rarity;                // common, rare, epic, legendary
    cost: number;                  // Precio en Nova Coins
    conditionType: UnlockCondition; // none, level, coins_earned, mission, event
    conditionValue?: number | string; // Valor de la condición
    icon: string;                  // Emoji o ruta a imagen
}
```

**Categorías de accesorios:**

**HEAD (Cabeza):**
- Gorra de Pensar (50 coins) - common
- Corona de Papel (75 coins) - common
- Sombrero Safari (200 coins) - rare, level 2
- Auriculares (250 coins) - rare
- Orejas de Gato (150 coins) - common

**FACE (Cara):**
- Visor Tech (100 coins) - common
- Gafas Cool (120 coins) - common

**TORSO/BODY (Cuerpo):**
- Capa Holo (500 coins) - rare, level 5

**BACK (Espalda):**
- Espada Energía (2000 coins) - legendary, event
- Skate (900 coins) - epic, 1500 coins earned

**HAND (Mano):**
- Globo Rojo (50 coins) - common
- Paleta Gigante (50 coins) - common
- Mapa del Tesoro (200 coins) - rare, level 2
- Varita Mágica (300 coins) - rare, level 3
- Libro de Hechizos (350 coins) - rare, level 4

**PET (Mascota):**
- Loro Pirata (800 coins) - epic, 1000 coins earned
- Dron Mascota (1000 coins) - epic, 2000 coins earned
- Bebé Dragón (2000 coins) - legendary, level 5
- Bebé Bot (2000 coins) - legendary, level 5

**EFFECT (Efectos):**
- Aura Digital (1500 coins) - epic, mission

---

## 💾 **BASE DE DATOS (SUPABASE)**

### **Tabla: `profiles`**

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    email TEXT,
    role TEXT, -- 'STUDENT', 'PARENT', 'ADMIN'
    level TEXT, -- 'primary', 'teen'
    avatar_id TEXT, -- ID del avatar base seleccionado
    equipped_accessories JSONB, -- Array de IDs de accesorios equipados
    owned_accessories JSONB, -- Array de IDs de accesorios comprados
    guardian_phone TEXT,
    parent_id UUID,
    must_change_password BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Ejemplo de datos:**
```json
{
    "id": "uuid-123",
    "name": "Juan Pérez",
    "avatar_id": "g4_astro",
    "equipped_accessories": ["acc_visor", "acc_cape", "acc_drone"],
    "owned_accessories": ["acc_visor", "acc_cape", "acc_drone", "acc_sword", "acc_balloon"]
}
```

---

### **Tabla: `economy`**

```sql
CREATE TABLE economy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coins INTEGER DEFAULT 100,
    total_earned INTEGER DEFAULT 100,
    total_spent INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);
```

**Ejemplo de datos:**
```json
{
    "user_id": "uuid-123",
    "coins": 1250,
    "total_earned": 2500,
    "total_spent": 1250
}
```

---

### **Tabla: `store_items` (Opcional - para admin)**

```sql
CREATE TABLE store_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    rarity TEXT NOT NULL,
    cost INTEGER NOT NULL,
    condition_type TEXT,
    condition_value TEXT,
    icon TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 **FLUJO DE SINCRONIZACIÓN**

### **1. Registro de nuevo estudiante**

```typescript
// services/supabase.ts - registerStudent()
1. Crear usuario en auth.users
2. Crear perfil en profiles con:
   - avatar_id: null (seleccionará después)
   - equipped_accessories: []
   - owned_accessories: []
3. Crear economía en economy con:
   - coins: 100 (bono de bienvenida)
```

---

### **2. Selección de avatar inicial**

```typescript
// components/Gamification/AvatarSelector.tsx
1. Usuario elige avatar de su grado
2. Se guarda en profiles.avatar_id
3. Se actualiza AvatarContext
4. Se muestra en todos los módulos
```

---

### **3. Ganar Nova Coins**

**Fuentes de coins:**
- Completar misión en Arena: +50 coins
- Completar tarea escolar: +100 coins
- Resolver problema de Math Maestro: +25 coins
- Logro especial: +200 coins

```typescript
// services/supabase.ts - adminAwardCoins()
1. Obtener balance actual de economy
2. Sumar coins ganados
3. Actualizar economy.coins
4. Actualizar economy.total_earned
5. Trigger realtime update
```

---

### **4. Comprar accesorio en Tienda Nova**

```typescript
// components/Gamification/AvatarShop.tsx
1. Usuario selecciona accesorio
2. Verificar condiciones:
   - ¿Tiene suficientes coins?
   - ¿Cumple nivel requerido?
   - ¿Cumple condición especial?
3. Si cumple:
   - Restar coins de economy
   - Agregar ID a profiles.owned_accessories
   - Actualizar economy.total_spent
4. Mostrar toast de confirmación
```

---

### **5. Equipar/Desequipar accesorio**

```typescript
// components/Gamification/AvatarDisplay.tsx
1. Usuario hace clic en accesorio comprado
2. Si está equipado:
   - Remover de profiles.equipped_accessories
3. Si no está equipado:
   - Agregar a profiles.equipped_accessories
   - Verificar límite por categoría (1 por tipo)
4. Actualizar Supabase
5. Actualizar AvatarContext
6. Re-render en todos los módulos
```

---

### **6. Visualización en módulos**

```typescript
// Todos los módulos usan AvatarContext
import { useAvatar } from '@/context/AvatarContext';

const { currentAvatar, equippedAccessories } = useAvatar();

// Renderizar avatar base
<img src={currentAvatar.baseImage} />

// Renderizar accesorios encima
{equippedAccessories.map(acc => (
    <img src={acc.icon} className="absolute" style={getPosition(acc.type)} />
))}
```

---

## 🎨 **IMÁGENES DE AVATARES**

### **Ubicación de imágenes:**
```
public/
├── avatars/
│   ├── g1_bunny.png
│   ├── g1_dino.png
│   ├── g1_princess.png (DiceBear URL)
│   ├── g1_knight.png (DiceBear URL)
│   ├── g1_cat.png (DiceBear URL)
│   ├── g1_robot.png
│   ├── g1_hero_girl.png (DiceBear URL)
│   ├── g1_hero_boy.png (DiceBear URL)
│   ├── g2_*.png (DiceBear URLs)
│   ├── g3_*.png (DiceBear URLs)
│   ├── g4_astro.png ✅ GENERADA
│   ├── g4_pixel.png ✅ GENERADA
│   ├── g4_street.png ✅ GENERADA
│   ├── g4_tech.png ✅ GENERADA
│   ├── g4_anime.png ✅ GENERADA
│   ├── g4_gamer.png ✅ GENERADA
│   ├── g5_*.png (Pendientes)
│   └── ...
└── pets/
    ├── dragon_baby.png
    └── robot_baby.png
```

### **Generación de imágenes faltantes:**

**Comando para generar más avatares:**
```typescript
// Usar generate_image tool con este formato:
Prompt: "A simple cute [CHARACTER] character BASE MODEL for elementary school, 
wearing ONLY [BASIC CLOTHES] with NO accessories, NO gadgets, just basic outfit, 
friendly face with big eyes, clean simple design, vibrant colors, Pixar style, 
child-friendly, full body view, white background"
```

**Importante:**
- ✅ SIN accesorios (gafas, sombreros, armas, etc.)
- ✅ Solo ropa básica
- ✅ Fondo blanco
- ✅ Estilo Pixar/3D cartoon
- ✅ Apropiado para niños

---

## 🔧 **CONFIGURACIÓN ACTUAL**

### **Archivos clave:**

1. **`components/Gamification/data/avatars.ts`**
   - Define todos los avatares y accesorios
   - Exporta arrays por grado

2. **`components/Gamification/AvatarSelector.tsx`**
   - Selector de avatar inicial
   - Filtrado por grado
   - Guarda en Supabase

3. **`components/Gamification/AvatarShop.tsx`**
   - Tienda de accesorios
   - Sistema de compra con coins
   - Verificación de condiciones

4. **`components/Gamification/AvatarDisplay.tsx`**
   - Visualización del avatar con accesorios
   - Equipar/desequipar
   - Cambio de avatar base

5. **`context/AvatarContext.tsx`**
   - Estado global del avatar
   - Sincronización con Supabase
   - Realtime updates

6. **`services/supabase.ts`**
   - Funciones de base de datos
   - Gestión de economía
   - Persistencia de avatar

---

## ✅ **CHECKLIST DE IMPLEMENTACIÓN**

### **Fase 1: Avatares Base** ✅ COMPLETA
- [✅] 40+ avatares definidos
- [✅] Organizados por grado (1°-5°)
- [✅] 4 niños + 4 niñas por grado
- [✅] Imágenes generadas para 4° grado
- [⏳] Imágenes pendientes para 1°, 2°, 3°, 5°

### **Fase 2: Sistema de Coins** ✅ COMPLETA
- [✅] Tabla `economy` en Supabase
- [✅] Balance inicial: 100 coins
- [✅] Funciones para ganar/gastar coins
- [✅] Realtime updates

### **Fase 3: Accesorios** ✅ COMPLETA
- [✅] 30+ accesorios definidos
- [✅] Categorías: head, face, torso, back, pet, effect, hand
- [✅] Rareza: common, rare, epic, legendary
- [✅] Condiciones de desbloqueo

### **Fase 4: Tienda Nova** ✅ COMPLETA
- [✅] Componente AvatarShop
- [✅] Sistema de compra
- [✅] Verificación de condiciones
- [✅] Persistencia en Supabase

### **Fase 5: Personalización** ✅ COMPLETA
- [✅] Equipar/desequipar accesorios
- [✅] Cambiar avatar base
- [✅] Preview en tiempo real
- [✅] Persistencia en profiles

### **Fase 6: Visualización** ⏳ PENDIENTE
- [⏳] Avatar en Dashboard
- [⏳] Avatar en Arena
- [⏳] Avatar en Math Maestro
- [⏳] Avatar en todos los módulos
- [⏳] Sincronización automática

---

## 🚀 **PRÓXIMOS PASOS**

1. **Copiar imágenes generadas a `/public/avatars/`**
2. **Generar imágenes faltantes** (1°, 2°, 3°, 5° grado)
3. **Probar flujo completo:**
   - Seleccionar avatar
   - Ganar coins
   - Comprar accesorio
   - Equipar accesorio
   - Ver en módulos
4. **Ajustar posicionamiento** de accesorios en avatar
5. **Agregar animaciones** (opcional)

---

## 📞 **SOPORTE**

Si necesitas:
- Generar más imágenes de avatares
- Agregar nuevos accesorios
- Modificar precios o condiciones
- Ajustar sistema de coins

Consulta este documento y los archivos mencionados.

---

**Última actualización:** 2026-01-04  
**Autor:** Antigravity AI
