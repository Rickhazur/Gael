# Especificaciones de Diseño para Relojes

## Requisitos Generales

Todos los relojes deben diseñarse para ajustarse perfectamente a la muñeca del avatar.

### Características Clave:

1. **Vista**: Frontal/plana, como si estuviera sobre una mesa
2. **Banda Abierta**: La correa/banda debe estar ABIERTA en la parte trasera (sin cerrar el círculo)
3. **Forma**: Diseño en forma de "C" o herradura
4. **Fondo**: Blanco puro (RGB 255,255,255) para transparencia
5. **Tamaño**: Aproximadamente 200x200px, centrado
6. **Estilo**: Realista con textura de materiales (metal, cuero, silicona)

### Diseño de la Banda:

```
     ╔═══════╗
     ║ RELOJ ║
     ║ CARA  ║
     ╚═══════╝
    /         \
   /           \
  |             |  <- Banda abierta en los extremos
  |             |
  └─────   ─────┘  <- ABIERTO (no conectado)
```

## Lista de Relojes a Crear:

### 1. Reloj Pulsera (Básico)
- **ID**: `acc_watch`
- **Estilo**: Reloj digital simple, banda de silicona negra
- **Pantalla**: LED azul
- **Precio**: 400 monedas

### 2. Reloj Digital Nova
- **ID**: `acc_watch_digital`
- **Estilo**: Reloj digital moderno, banda de silicona morada/cyan
- **Pantalla**: LCD con logo Nova
- **Precio**: 600 monedas

### 3. Reloj Deportivo Pro
- **ID**: `acc_watch_sport`
- **Estilo**: Reloj deportivo tipo Casio G-Shock
- **Banda**: Silicona resistente, colores vibrantes (rojo/negro)
- **Características**: Cronómetro visible
- **Precio**: 800 monedas

### 4. Reloj de Oro
- **ID**: `acc_watch_gold`
- **Estilo**: Reloj clásico elegante
- **Banda**: Eslabones dorados brillantes
- **Cara**: Dorada con números romanos
- **Precio**: 1500 monedas

### 5. SmartWatch Elite
- **ID**: `acc_watch_smart`
- **Estilo**: Apple Watch / Samsung Galaxy Watch
- **Banda**: Silicona premium negra o blanca
- **Pantalla**: OLED con interfaz colorida
- **Precio**: 2000 monedas

### 6. Reloj de Diamantes
- **ID**: `acc_watch_diamond`
- **Estilo**: Reloj de lujo ultra premium
- **Banda**: Platino con incrustaciones de diamantes
- **Cara**: Cristal de zafiro con brillantes
- **Efecto**: Brillo/destello sutil
- **Precio**: 3000 monedas

## Ejemplo de Prompt para Generación:

```
A [TIPO DE RELOJ] wristwatch viewed from above, flat lay photography. 
The watch band is OPEN at the back in a C-shape or horseshoe design - 
NOT connected in a complete circle. The band ends should be clearly 
separated to fit over an avatar's wrist. [MATERIAL] band with [COLOR] 
finish. Watch face shows [DETALLES]. Pure white background (RGB 255,255,255). 
Photorealistic 3D render with realistic textures and subtle shadows. 
Centered composition, professional product photography.
```

## Notas Importantes:

- ✅ La banda DEBE estar abierta (no formar un círculo completo)
- ✅ Los extremos de la banda deben estar claramente separados
- ✅ Fondo blanco puro para fácil recorte/transparencia
- ✅ Vista desde arriba (flat lay)
- ✅ Textura realista según el material
- ❌ NO cerrar la banda en círculo completo
- ❌ NO usar fondos con texturas o colores
