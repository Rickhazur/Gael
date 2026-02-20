# 🤝 Guía de Contribución - Nova Schola Elementary

¡Gracias por tu interés en contribuir a Nova Schola! Esta guía te ayudará a empezar.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guías de Estilo](#guías-de-estilo)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Características](#sugerir-características)

---

## 📜 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de edad, tamaño corporal, discapacidad, etnia, identidad y expresión de género, nivel de experiencia, nacionalidad, apariencia personal, raza, religión o identidad y orientación sexual.

### Comportamiento Esperado

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista
- Aceptar críticas constructivas
- Enfocarse en lo mejor para la comunidad
- Mostrar empatía hacia otros miembros

---

## 🚀 Cómo Contribuir

### 1. Fork el Repositorio

```bash
# Click en "Fork" en GitHub
# Luego clona tu fork
git clone https://github.com/TU-USUARIO/nova-schola-elementary.git
cd nova-schola-elementary
```

### 2. Crear Rama

```bash
# Crear rama descriptiva
git checkout -b feature/nombre-caracteristica
# o
git checkout -b fix/nombre-bug
```

### 3. Hacer Cambios

- Escribe código limpio y documentado
- Sigue las guías de estilo
- Agrega tests si es posible
- Actualiza documentación si es necesario

### 4. Commit

```bash
# Usa Conventional Commits
git commit -m "feat: agregar nueva característica"
git commit -m "fix: corregir bug en componente"
git commit -m "docs: actualizar README"
```

### 5. Push y Pull Request

```bash
git push origin feature/nombre-caracteristica
```

Luego abre un Pull Request en GitHub.

---

## 🔧 Proceso de Desarrollo

### Setup Inicial

```bash
# Instalar dependencias
npm install

# Copiar .env.example a .env
cp .env.example .env

# Configurar variables de entorno
# Editar .env con tus credenciales

# Iniciar desarrollo
npm run dev
```

### Comandos Útiles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Build
npm run build        # Construir para producción
npm run preview      # Preview del build

# Linting
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Arreglar problemas automáticamente

# Testing (cuando esté implementado)
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Cobertura de tests

# Type checking
npm run type-check   # Verificar tipos de TypeScript
```

---

## 📝 Guías de Estilo

### TypeScript

```typescript
// ✅ BIEN
interface UserProps {
  name: string;
  age: number;
  email?: string;
}

const getUserName = (user: UserProps): string => {
  return user.name;
};

// ❌ MAL
const getUserName = (user: any) => {
  return user.name;
};
```

### React Components

```tsx
// ✅ BIEN - Functional component con tipos
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// ❌ MAL - Sin tipos, class component
class Button extends React.Component {
  render() {
    return <button>{this.props.label}</button>;
  }
}
```

### CSS/Tailwind

```tsx
// ✅ BIEN - Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg">
  <h1 className="text-2xl font-bold text-slate-800">Title</h1>
</div>

// ❌ MAL - Inline styles
<div style={{ display: 'flex', padding: '24px' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

### Naming Conventions

```typescript
// Components: PascalCase
export const UserProfile = () => {};

// Functions: camelCase
const calculateTotal = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Files:
// - Components: PascalCase.tsx
// - Utilities: camelCase.ts
// - Hooks: useCamelCase.ts
```

### Commits (Conventional Commits)

```bash
# Tipos permitidos:
feat:     # Nueva característica
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Formato, punto y coma, etc (no afecta código)
refactor: # Refactorización de código
perf:     # Mejora de performance
test:     # Agregar tests
chore:    # Mantenimiento, dependencias

# Ejemplos:
git commit -m "feat: add visual concept detection"
git commit -m "fix: resolve notebook loading issue"
git commit -m "docs: update installation guide"
git commit -m "refactor: simplify auth logic"
```

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no esté ya reportado
2. Asegúrate de estar en la última versión
3. Intenta reproducir el bug

### Template de Bug Report

```markdown
**Descripción del Bug**
Descripción clara y concisa del bug.

**Pasos para Reproducir**
1. Ir a '...'
2. Click en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento Esperado**
Qué esperabas que pasara.

**Screenshots**
Si aplica, agrega screenshots.

**Entorno:**
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

---

## 💡 Sugerir Características

### Template de Feature Request

```markdown
**¿Tu solicitud está relacionada con un problema?**
Descripción clara del problema. Ej: "Siempre me frustra cuando..."

**Solución Propuesta**
Descripción clara de lo que quieres que pase.

**Alternativas Consideradas**
Otras soluciones o características que consideraste.

**Contexto Adicional**
Screenshots, mockups, ejemplos de otras apps, etc.
```

---

## ✅ Checklist de Pull Request

Antes de enviar tu PR, verifica:

- [ ] El código sigue las guías de estilo
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Tests nuevos y existentes pasan localmente
- [ ] He actualizado el CHANGELOG (si aplica)

---

## 🎯 Áreas que Necesitan Ayuda

### Alta Prioridad
- [ ] Tests automatizados (Jest, React Testing Library)
- [ ] Documentación de componentes (Storybook)
- [ ] Optimización de performance
- [ ] Accesibilidad (A11Y)

### Media Prioridad
- [ ] Internacionalización (i18n) para más idiomas
- [ ] Modo oscuro
- [ ] Más módulos educativos
- [ ] Integración con más LMS

### Baja Prioridad
- [ ] Temas personalizables
- [ ] Exportación de datos
- [ ] Estadísticas avanzadas

---

## 📚 Recursos Útiles

- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🙋 Preguntas

Si tienes preguntas, puedes:

1. Abrir un [Discussion](https://github.com/novaschola/discussions)
2. Unirte a nuestro [Discord](https://discord.gg/novaschola)
3. Enviar email a dev@novaschola.com

---

## 🎉 Reconocimientos

Todos los contribuidores serán reconocidos en:
- README.md
- Página de créditos en la app
- Releases notes

---

**¡Gracias por contribuir a Nova Schola!** 🚀✨
