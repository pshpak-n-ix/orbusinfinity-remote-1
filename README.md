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

The application uses a modular configuration structure for better maintainability:

### Configuration Files

- **`config/mf-config.js`** - Module federation settings (shared dependencies, exposed modules)
- **`config/api-config.js`** - GraphQL API endpoints
- **`config/build-config.js`** - Build settings (ports, CORS, source maps, minification, splitChunks)
- **`config/environments.js`** - Main configuration that combines all modular configs

### Port Configuration

- **Development**: Runs on port 3002
- **Production**: Served through nginx on port 8080 with versioned paths

The configuration automatically handles:

- Dynamic `publicPath` generation based on environment
- CORS settings for cross-origin requests
- Module federation shared dependencies
- Environment-specific build optimizations

## Module Federation

This application exposes the following modules:

```javascript
{
  './TodoList': './src/components/TodoListWrapper'
}
```

The `TodoList` component can be imported and used by the host application to display todo functionality.
