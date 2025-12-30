# Cursor IDE Setup for RentalEase CRM

This guide will help you set up Cursor IDE optimally for working with the RentalEase CRM project.

## 🚀 Quick Setup

### 1. Open the Workspace
Open the `rentalease-crm.code-workspace` file in Cursor to load the pre-configured workspace with all folders and settings.

### 2. Install Recommended Extensions
Cursor will automatically suggest installing the recommended extensions. Accept the installation to get:
- Prettier for code formatting
- ESLint for JavaScript/TypeScript linting
- TypeScript support
- SASS/SCSS language support
- Auto Rename Tag
- Path Intellisense
- Error Lens for inline error display
- Code Spell Checker

### 3. Install Dependencies
Use the built-in task runner (Ctrl/Cmd + Shift + P → "Tasks: Run Task"):
- Run "Install All Dependencies" to install both frontend and backend dependencies

### 4. Start Development
- Run "🚀 Start Full Stack Development" task to start both servers simultaneously
- Or start them individually:
  - Backend: "Start Backend Dev Server"
  - Frontend: "Start Frontend Dev Server"

## 📁 Project Structure Overview

```
rentalease_crm/
├── 🎨 RentalEase-CRM/           # React/TypeScript Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Route-specific pages
│   │   ├── store/              # Redux store setup
│   │   ├── services/           # API service layer
│   │   └── styles/             # Global SCSS styles
│   ├── package.json
│   └── vite.config.ts
├── ⚙️ RentalEase-CRM-Server/    # Node.js/Express Backend
│   ├── controllers/            # Route handlers
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   └── package.json
├── 📋 Configuration Files
│   ├── .cursorrules            # Cursor IDE rules and conventions
│   ├── .cursorignore          # Files to exclude from AI context
│   ├── CLAUDE.md              # Comprehensive project documentation
│   └── .vscode/               # IDE-specific configurations
└── 🔧 Workspace Files
    └── rentalease-crm.code-workspace
```

## 🛠️ Available Tasks

Access via Command Palette (Ctrl/Cmd + Shift + P → "Tasks: Run Task"):

### Development Tasks
- **🚀 Start Full Stack Development**: Starts both frontend and backend servers
- **Start Frontend Dev Server**: React dev server with Vite (localhost:5173)
- **Start Backend Dev Server**: Express server with nodemon (localhost:3000)

### Build Tasks
- **Build Frontend**: Production build with type checking
- **Type Check Frontend**: TypeScript compilation check
- **Lint Frontend**: ESLint check and auto-fix

### Setup Tasks
- **Install All Dependencies**: Install dependencies for both projects
- **Install Frontend Dependencies**: Frontend only
- **Install Backend Dependencies**: Backend only

## 🔧 Development Workflow

### Starting Development
1. Open workspace file in Cursor
2. Run "🚀 Start Full Stack Development" task
3. Frontend will be available at http://localhost:5173
4. Backend API at http://localhost:3000/api/v1

### Making Changes
1. Frontend changes trigger hot module reload automatically
2. Backend changes restart the server via nodemon
3. TypeScript errors show inline with Error Lens
4. Code formats automatically on save with Prettier

### Code Style
- **TypeScript**: Strict mode enabled, proper typing required
- **React**: Functional components with hooks
- **SCSS**: Component-scoped modules with BEM methodology
- **Backend**: ES modules, async/await, proper error handling

## 🎯 Cursor-Specific Features

### AI Code Completion
- Context-aware suggestions based on project structure
- Understands TypeScript interfaces and React patterns
- Suggests appropriate SCSS classes and styles
- Backend route and middleware suggestions

### File Navigation
- File nesting enabled for related files (e.g., .scss with .tsx)
- Quick file switching with Ctrl/Cmd + P
- Symbol search with Ctrl/Cmd + Shift + O

### Debugging
- Configured launch configurations for both frontend and backend
- Source maps enabled for debugging TypeScript
- Chrome debugging support for frontend

### Code Snippets
Available snippets (type prefix + Tab):
- `rfc`: React Functional Component with TypeScript
- `rhook`: Custom React Hook
- `express-route`: Express route handler with error handling
- `mongoose-schema`: Mongoose schema definition
- `redux-slice`: Redux Toolkit slice
- `api-service`: API service function
- `interface`: TypeScript interface
- `scss-module`: SCSS module with BEM

## 🔍 Search and Exclude Patterns

### Excluded from Search
- `node_modules/`
- `dist/` and `build/` directories
- Log files
- Generated source maps
- Coverage reports

### File Nesting
- TypeScript files show related JavaScript files
- SCSS files show generated CSS files
- Configuration files grouped logically

## 📝 Code Conventions

### Frontend (React/TypeScript)
```typescript
// Component structure
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  const [state, setState] = useState<Type>(initialValue);
  
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  return (
    <div className={styles.container}>
      {/* Component JSX */}
    </div>
  );
};
```

### Backend (Node.js/Express)
```javascript
// Route handler structure
export const handlerName = async (req, res) => {
  try {
    const { param } = req.body;
    
    // Business logic
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
```

### SCSS (Component Modules)
```scss
.container {
  // Base styles
  
  &__element {
    // Element styles
  }
  
  &--modifier {
    // Modifier styles
  }
}
```

## 🚨 Common Issues & Solutions

### Port Conflicts
- Frontend: Change port in `vite.config.ts` if 5173 is occupied
- Backend: Change PORT in `.env` file if 3000 is occupied

### TypeScript Errors
- Reload TypeScript server: Ctrl/Cmd + Shift + P → "TypeScript: Reload Projects"
- Check `tsconfig.json` configuration in frontend project

### ESLint Issues
- Ensure you're in the correct directory (RentalEase-CRM) for frontend linting
- Run "Lint Frontend" task to see and fix issues

### Module Resolution
- Restart TypeScript language server if imports aren't resolving
- Check relative vs absolute import settings in TypeScript config

## 💡 Pro Tips

1. **Use the Command Palette**: Ctrl/Cmd + Shift + P for quick access to all features
2. **Multi-cursor Editing**: Ctrl/Cmd + D to select multiple instances
3. **Quick Open**: Ctrl/Cmd + P for fast file navigation
4. **Symbol Search**: Ctrl/Cmd + Shift + O to find functions/components
5. **Format Document**: Shift + Alt + F (or auto-format on save)
6. **Toggle Terminal**: Ctrl/Cmd + ` for quick terminal access
7. **Problem View**: View → Problems to see all errors/warnings
8. **Git Integration**: Built-in source control with visual diff

## 🔗 Useful Links

- [Cursor Documentation](https://docs.cursor.sh/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Express.js Guide](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

Happy coding! 🎉