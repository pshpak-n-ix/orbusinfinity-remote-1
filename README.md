# Remote Application 1

A placeholder project to simulate a Remote in the Micro Frontend (MFE) architecture. This application exposes a `TodoList` component via module federation.

## Available Scripts

```bash
# Development
npm start          # Start development server (port 3002)
npm run start:dev  # Start with NODE_ENV=development

# Build
npm run build      # Build for current environment
npm run build:dev  # Build for development
npm run build:prod # Build for production

# Testing & Quality
npm test           # Run tests
npm run lint       # Check code quality
npm run lint:fix   # Fix linting issues
npm run format     # Format code with Prettier

# Utilities
npm run config:show  # Display current configuration
npm run analyze     # Bundle size analysis
```

## Configuration

Settings can be updated in `config/environments.js` to modify ports, API endpoints, build options, and CORS settings.
