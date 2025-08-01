[![Continuous Integration Workflow](https://github.com/GG-TEAM-CC/react-template/actions/workflows/integration.yml/badge.svg)](https://github.com/GG-TEAM-CC/react-template/actions/workflows/integration.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=GG-TEAM-CC_chess_proyect&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=GG-TEAM-CC_chess_proyect)

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Project Structure (Clean Architecture Example)

```
src/
  domain/
    models/
      Todo.ts            # Entity definition for Todo
    services/
      FetchTodos.ts      # Use case for fetching todos
      TodoRepository.ts  # Repository for todos
  data/                 # (optional, for real API/data sources)
  presentation/
    components/
      TodoList.tsx       # UI component to display todos
    hooks/
      UseTodos.ts        # Custom hook to use todos in components
    pages/
      HomePage.tsx       # Main page displaying the todo list
  shared/
    types/               # Shared types/interfaces
  assets/                # Static assets (images, icons, etc.)
  styles/                # CSS/SCSS files
  utils/                 # Utility functions
  config/                # App configuration files
  contexts/              # React context providers

public/                  # Static public files

App.tsx                  # App entry point
main.tsx                 # ReactDOM render
vite-env.d.ts            # Vite environment types
```

- **domain/**: Business logic, entities, use cases, and repositories.
- **presentation/**: React components, hooks, and pages (UI layer).
- **shared/**: Types and interfaces shared across layers.
- **assets/**, **styles/**, **utils/**, **config/**, **contexts/**: Usual React project folders for static files, styling, utilities, configuration, and context providers.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
