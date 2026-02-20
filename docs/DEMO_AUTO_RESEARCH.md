# 🎬 Configurar Demo Automático - Centro de Investigación

## Objetivo:
Que el campo de búsqueda ya tenga "El Ciclo del Agua" escrito automáticamente en modo demo.

---

## 📝 Archivo a Editar:
```
components/ResearchCenter/ResearchCenter.tsx
```

---

## 🎯 Cambio a Realizar:

### Busca la línea 53:
```typescript
const [searchQuery, setSearchQuery] = useState('');
```

### Cámbiala por:
```typescript
// Pre-fill with demo query for automatic demo mode
const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('nova_demo_mode') === 'true';
const [searchQuery, setSearchQuery] = useState(isDemoMode ? 'El Ciclo del Agua' : '');
```

---

## ✅ Resultado:
Después de este cambio:
- ✅ Cuando entres como usuario demo, el campo ya tendrá "El Ciclo del Agua" escrito
- ✅ Solo necesitas presionar Enter o hacer clic en "Investigar"
- ✅ Nova generará automáticamente la información
- ✅ Perfecto para presentaciones sin tener que escribir nada

---

## 🚀 Pasos:
1. Abre `components/ResearchCenter/ResearchCenter.tsx`
2. Ve a la línea 53
3. Reemplaza esa línea con las 3 líneas nuevas
4. Guarda el archivo
5. Recarga la app en el navegador
6. Entra como demo y ve al Centro de Investigación

---

**El campo ya estará lleno con "El Ciclo del Agua" listo para investigar.** ✨
