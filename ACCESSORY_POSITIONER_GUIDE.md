# 🎨 Herramienta de Posicionamiento de Accesorios

## Cómo Acceder

Para acceder a la herramienta de posicionamiento de accesorios, abre la consola del navegador (F12) y ejecuta:

```javascript
// Cambiar a la vista del posicionador
window.dispatchEvent(new CustomEvent('change-view', { detail: 'ACCESSORY_POSITIONER' }));
```

O puedes modificar temporalmente el código para agregar un botón en el sidebar de administrador.

## Cómo Usar

1. **Selecciona un Avatar**: Haz clic en uno de los avatares en la cuadrícula inferior izquierda
2. **Selecciona el Tipo de Accesorio**: Elige entre head, face, torso, legs, feet
3. **Selecciona un Accesorio**: Haz clic en el accesorio que quieres posicionar
4. **Ajusta la Posición**:
   - **Posición X**: Mueve el accesorio horizontalmente (-50% a +50%)
   - **Posición Y**: Mueve el accesorio verticalmente (-50% a +50%)
   - **Escala**: Cambia el tamaño (0.5x a 2x)
   - **Rotación**: Rota el accesorio (-45° a +45°)
5. **Exporta los Offsets**: Haz clic en "Exportar Offsets" para copiar el código al portapapeles
6. **Pega en avatars.ts**: Abre `components/Gamification/data/avatars.ts` y pega los offsets en el avatar correspondiente

## Ejemplo de Uso

Si ajustas las gafas para el avatar "g1_bunny", el código exportado se verá así:

```typescript
// Super Conejo
offsets: {
    "face": {
        "x": -5,
        "y": 10,
        "scale": 0.85,
        "rotate": 2
    }
}
```

Copia este código y pégalo en la definición del avatar en `avatars.ts`:

```typescript
{
    id: 'g1_bunny',
    name: 'Super Conejo',
    description: 'Salta muy alto y es muy rápido.',
    personality: 'Enérgico',
    colors: ['#FFC0CB', '#FFFFFF'],
    style: 'Cute Animal',
    baseImage: '/avatars/g1_bunny.png',
    offsets: {
        "face": {
            "x": -5,
            "y": 10,
            "scale": 0.85,
            "rotate": 2
        }
    }
}
```

## Consejos

- **Trabaja avatar por avatar**: Ajusta todos los accesorios para un avatar antes de pasar al siguiente
- **Prueba en diferentes tamaños**: Verifica que se vea bien tanto en `size="sm"` como en `size="lg"`
- **Guarda frecuentemente**: Exporta y guarda tus cambios regularmente
- **Resetea si es necesario**: Usa el botón "Resetear" si quieres volver a los valores por defecto

## Acceso Rápido (Temporal)

Para acceso más fácil, puedes agregar temporalmente un botón en el AdminSidebar:

```tsx
<button onClick={() => onViewChange(ViewState.ACCESSORY_POSITIONER)}>
    🎨 Posicionar Accesorios
</button>
```
