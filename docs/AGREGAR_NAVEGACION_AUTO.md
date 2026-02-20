# 🔧 AGREGAR NAVEGACIÓN AUTOMÁTICA AL DEMO TOUR

## 📝 ARCHIVO: `components/MainLayout.tsx`

## 🎯 UBICACIÓN: Después de la línea 70

### **Busca esta sección (línea 69-73):**
```typescript
    const { language, setLanguage } = useLearning();
    const { currentAvatar, isLoading } = useAvatar();

    // Map bilingual to 'es' for components that don't support it yet
    const effectiveLanguage = language === 'bilingual' ? 'es' : language;
```

### **DESPUÉS de esa sección, agrega estas líneas:**

```typescript
    // Demo Tour: Auto-navigate when step changes
    const { tourState, getCurrentStepData } = useDemoTour();
    
    useEffect(() => {
        if (tourState.isActive) {
            const currentStep = getCurrentStepData();
            if (currentStep && currentStep.view) {
                setCurrentView(currentStep.view);
            }
        }
    }, [tourState.currentStep, tourState.isActive]);
```

---

## 🎯 DEBE QUEDAR ASÍ:

```typescript
69:     const { language, setLanguage } = useLearning();
70:     const { currentAvatar, isLoading } = useAvatar();
71: 
72:     // Map bilingual to 'es' for components that don't support it yet
73:     const effectiveLanguage = language === 'bilingual' ? 'es' : language;
74:
75:     // Demo Tour: Auto-navigate when step changes
76:     const { tourState, getCurrentStepData } = useDemoTour();
77:     
78:     useEffect(() => {
79:         if (tourState.isActive) {
80:             const currentStep = getCurrentStepData();
81:             if (currentStep && currentStep.view) {
82:                 setCurrentView(currentStep.view);
83:             }
84:         }
85:     }, [tourState.currentStep, tourState.isActive]);
86:
87:     // Prevent premature Avatar Selection while loading profile
```

---

## ✅ DESPUÉS DE AGREGAR:

1. Guarda el archivo (Ctrl + S)
2. Recarga la app (F5)
3. Click en "VER DEMO INTERACTIVA"
4. Click en "Siguiente"
5. **AHORA SÍ debería navegar automáticamente**

---

**Agrega esas 11 líneas después de la línea 73.** 🚀
