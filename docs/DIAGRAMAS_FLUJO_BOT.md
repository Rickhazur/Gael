# 🤖 Diagramas de Flujo de Respuesta del Bot

Este documento detalla paso a paso cómo el sistema `MathValidator` procesa, calcula y responde a las nuevas operaciones matemáticas implementadas.

---

## 1. Mínimo Común Múltiplo (MCM / LCM)
**Contexto:** Se activa automáticamente cuando el usuario intenta sumar o restar fracciones con **denominadores distintos**.

### 📝 Ejemplo: "1/4 + 1/6"

**1. Detección:**
*   El sistema detecta el patrón `fracción + fracción`.
*   Verifica denominadores: `4 !== 6`.
*   **Acción:** Inyecta pasos de LCM antes de resolver la suma.

**2. Flujo de Respuesta (Paso a Paso):**

| Paso | Operación Interna | Mensaje del Bot (ES) | Visual (Pizarra) |
| :--- | :--- | :--- | :--- |
| **0** (LCM) | Calcula múltiplos:<br>4: `4, 8, 12`<br>6: `6, 12` | "Para sumar/restar con distinto denominador, buscamos el Mínimo Común Múltiplo (MCM). Mira las listas de la tabla del 4 y el 6. ¿Ves el primer número que se repite? ¡Es 12!" | **Listas de Múltiplos**<br>Muestra dos filas de números.<br>El número **12** aparece encerrado en un círculo brillante. |
| **1** (Conversión) | `1/4 -> 3/12` | "Convertimos 1/4 a doceavos. Multiplicamos por 3." | **Barra de Fracción**<br>Muestra 3 bloques coloreados de 12. |
| **2** (Conversión) | `1/6 -> 2/12` | "Convertimos 1/6 a doceavos. Multiplicamos por 2." | **Barra de Fracción**<br>Muestra 2 bloques coloreados de 12. |
| **3** (Suma) | `3/12 + 2/12` | "Ahora sumamos los numeradores: 3 + 2 = 5. El denominador se mantiene igual." | **Operación Vertical**<br>Muestra la suma final. |

---

## 2. Conversión: Decimal a Fracción
**Contexto:** El usuario pide "convierte 0.5 a fracción".

### 📝 Ejemplo: "0.5"

**1. Detección:**
*   Palabras clave: `convert`, `transforma`, `cambia`.
*   Entrada contiene punto decimal `.`.

**2. Flujo de Respuesta:**

| Paso | Operación Interna | Mensaje del Bot (ES) | Visual (Pizarra) |
| :--- | :--- | :--- | :--- |
| **1** (Planteo) | Identifica decimales (1 dígito).<br>Base = 10^1 = 10.<br>Num = 5. | "Para convertir 0.5 a fracción, miramos los decimales. Como tiene 1 decimal, dividimos por 10." | **Fracción (Barra)**<br>Dibuja una barra dividida en 10, con 5 partes llenas (`5/10`). |
| **2** (Simplificación) | Calcula GCD(5, 10) = 5.<br>Divide ambos por 5. | "¡Podemos simplificar! Ambos se pueden dividir por 5. La fracción irreducible es 1/2." | **Fracción (Barra)**<br>Se redibuja la barra, ahora dividida en 2, con 1 parte llena (`1/2`). |

---

## 3. Conversión: Fracción a Decimal
**Contexto:** El usuario pide "convierte 3/4 a decimal".

### 📝 Ejemplo: "3/4"

**1. Detección:**
*   Palabras clave de conversión + formato fracción `/`.

**2. Flujo de Respuesta:**

| Paso | Operación Interna | Mensaje del Bot (ES) | Visual (Pizarra) |
| :--- | :--- | :--- | :--- |
| **1** (Concepto) | Explica la relación fracción-división. | "Una fracción es una división. Para convertirla a decimal, dividimos el numerador entre el denominador." | **Texto / Ecuación**<br>`3/4 = ?` |
| **2** (División) | Inicia división long-form:<br>`3 ÷ 4` | (Inicia el proceso estándar de división decimal paso a paso del tutor) | **División (Casita)**<br>Dibuja la estructura de división `4 ) 3.00` |

---

## 4. Geometría (Área y Perímetro)
**Contexto:** Cálculo de propiedades de formas básicas.

### 📝 Ejemplo: "Area cuadrado 5"

**1. Detección:**
*   Palabra clave: `area`.
*   Forma: `cuadrado`.
*   Parámetro: `5`.

**2. Flujo de Respuesta:**

| Paso | Operación Interna | Mensaje del Bot (ES) | Visual (Pizarra) |
| :--- | :--- | :--- | :--- |
| **1** (Cálculo) | Fórmula: L x L.<br>5 x 5 = 25. | "Área = Lado × Lado. 5 × 5 = 25" | **Forma Geométrica**<br>Dibuja un cuadrado.<br>Etiqueta el lado como "Side=5". |

### 📝 Ejemplo: "Perimetro rectangulo 4 6" (Base 4, Altura 6)

| Paso | Operación Interna | Mensaje del Bot (ES) | Visual (Pizarra) |
| :--- | :--- | :--- | :--- |
| **1** (Cálculo) | Fórmula: 2b + 2h.<br>2(4) + 2(6) = 20. | "Perímetro = 2×Base + 2×Altura = 20" | **Forma Geométrica**<br>Dibuja un rectángulo.<br>Etiqueta "b=4", "h=6". |

---

## 5. Porcentajes
**Contexto:** Calcular porcentaje de un número.

### 📝 Ejemplo: "20% de 50"

**1. Detección:**
*   Símbolo `%` o palabra `porcentaje`.

**2. Flujo de Respuesta:**

| Paso | Operación Interna | Mensaje del Bot (ES) | Visual (Pizarra) |
| :--- | :--- | :--- | :--- |
| **1** (Multiplicación) | `20 x 50 = 1000` | "1. Multiplicamos: 20 × 50 = 1000" | **Operación Vertical**<br>Muestra `20 x 50` resuelto. |
| **2** (División) | `1000 / 100 = 10` | "2. Dividimos entre 100: 1000 ÷ 100 = 10" | **Operación Vertical**<br>Muestra `1000 ÷ 100` simplificado. |
