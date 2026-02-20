# Reconocimiento de enunciados típicos colombianos (5° grado)

Lista de enunciados representativos de colegios colombianos (MEN, cuadernos de actividades, problemas verbales) y verificación de si el bot los reconoce.

---

## Cómo se comprueba

1. **Parser de problemas verbales**: `parseWordProblem` (tanque) y `parseGenericWordProblem` (suma, resta, multiplicación, división, multi-paso).
2. **Bot completo**: `AlgorithmicTutor.generateResponse(text, [], 'es')` — si devuelve pasos, el bot guía al niño.

Los enunciados están en `data/colombianEnunciados.ts`. Las pruebas automáticas en `data/colombianEnunciados.test.ts` (ejecutar con `npx vitest run data/colombianEnunciados.test.ts`).

---

## Resultado por tipo de enunciado

### Tanque (capacidad, mitad, fracción, añadir, faltan)

| Enunciado (resumen) | Parser WP | Bot |
|---------------------|-----------|-----|
| Tanque 200 L, mitad, se gastaron **dos quintos**, añadieron 15 L, ¿faltan? | ✅ | ✅ |
| Depósito 200 L, mitad, gastaron **2/5**, ¿cuántos quedan? | ✅ | ✅ |

**Nota:** Se añadió reconocimiento de fracciones en palabras ("dos quintos", "tres cuartos", "un tercio", "un cuarto") en `wordProblemParser.ts` para enunciados colombianos.

---

### Suma de cantidades (kg, litros, total)

| Enunciado (resumen) | Parser genérico | Bot |
|---------------------|-----------------|-----|
| Ana compró 2,5 kg y 1,75 kg, ¿cuántos kg en total? | ✅ add_quantities | ✅ |
| Compré 3 kg arroz y 2 kg frijoles, ¿cuántos kg en total? | ✅ add_quantities | ✅ |
| Camión 120 L leche y 85 L jugo, ¿cuántos litros en total? | ✅ add_quantities | ✅ |

---

### Resta (quedan)

| Enunciado (resumen) | Parser genérico | Bot |
|---------------------|-----------------|-----|
| Había 50 kg arroz, vendieron 20 kg, ¿cuántos kg quedan? | ✅ subtract_quantities | ✅ |
| Tenía 100 L agua, gasté 35 L, ¿cuántos litros quedan? | ✅ subtract_quantities | ✅ |

---

### Multi-paso (tenía, compró, vendió, regaló)

| Enunciado (resumen) | Parser genérico | Bot |
|---------------------|-----------------|-----|
| Juan tenía 50 pesos, compró jugo 30, abuela regaló 20, ¿cuántos tiene? | ✅ multi_step | ✅ |
| Fiesta: 425 almendrucos más que el pasado; el pasado 875, ¿cuántos en los dos años? | ✅ add_quantities (patrón "más/pasado/total") | ✅ |

**Nota:** Se añadió un patrón para "X más que el pasado. El pasado Y. ¿cuántos en total / en los dos años?" que reconoce los dos números y devuelve suma.

---

### Multiplicación (cajas, cada una, total)

| Enunciado (resumen) | Parser genérico | Bot |
|---------------------|-----------------|-----|
| 4 cajas con 12 manzanas cada una, ¿cuántas en total? | ✅ multiply_quantities | ✅ |
| 5 paquetes de 6 galletas, ¿cuántas galletas en total? | ✅ multiply_quantities | ✅ |

---

### División (repartir entre, cada uno)

| Enunciado (resumen) | Parser genérico | Bot |
|---------------------|-----------------|-----|
| 36 galletas entre 6 niños, ¿cuántas cada uno? | ✅ divide_quantities | ✅ |
| Repartir 60 dulces entre 5 niños, ¿cuántos cada uno? | ✅ divide_quantities | ✅ |
| 48 hojas entre 8 estudiantes, ¿cuántas cada uno? | ✅ divide_quantities | ✅ |

---

### Geometría

| Enunciado (resumen) | Detección (parse) | Bot |
|---------------------|-------------------|-----|
| Rectángulo 5 m largo y 3 m ancho, ¿perímetro? | ✅ geometry (perimeter) | ✅ |
| Área rectángulo 8 por 4 | ✅ geometry (area) | ✅ |
| Área triángulo base 4 altura 3 | ✅ geometry (triangle area) | ✅ |
| Área círculo radio 3 | ✅ geometry (circle area) | ✅ |
| Volumen cubo lado 3 | ✅ geometry (cube volume) | ✅ |

---

### Operaciones directas

| Enunciado | Detección | Bot |
|-----------|-----------|-----|
| 2456 ÷ 12 | ✅ division | ✅ |
| 2/5 + 1/3 | ✅ fraction | ✅ |
| 20% de 150 | ✅ percentage | ✅ |

---

## Resumen

- **Tanque con “dos quintos” en palabras:** reconocido tras añadir `parseFractionWords` (fracciones en palabras).
- **Suma, resta, multiplicación, división y multi-paso** con redacciones típicas colombianas (kg, litros, total, quedan, repartir, cajas, cada uno): el parser genérico los reconoce y el bot guía.
- **Geometría** (rectángulo, triángulo, círculo, cubo) y **operaciones** (÷, fracciones, %): el bot los reconoce y responde con pasos.
- **Casos que no matchean el parser** (p. ej. “cuántos en los dos años” sin “y” entre números): el bot **sigue respondiendo** vía AI, sin guía paso a paso estructurada.

---

## Cómo ejecutar las pruebas

```bash
npx vitest run data/colombianEnunciados.test.ts --reporter=verbose
```

Si Vitest no está disponible o falla por entorno, se puede revisar manualmente cada enunciado en el tutor de matemáticas (Profe de mate) pegando el texto.
