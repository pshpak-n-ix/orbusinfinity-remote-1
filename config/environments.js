const baseConfig = {
  appName: 'remote-1',
  displayName: 'Remote Application 1',
  version: '0.1.0',

  ports: {
    dev: 3002,
  },

  federation: {
    name: 'remote_app_1',
    filename: 'remoteEntry.js',
    exposes: {
      './TodoList': './src/components/TodoListWrapper',
    },
    shared: {
      react: { singleton: true, requiredVersion: '>=18.3.1' },
      'react-dom': { singleton: true, requiredVersion: '>=18.3.1' },
      'react-router-dom': { singleton: true, requiredVersion: '>=6.29.0' },
      '@fluentui/react-components': {
        singleton: true,
        requiredVersion: '>=9.68.3',
      },
      '@orbusinfinity-shared/ui-components': {
        singleton: false,
        requiredVersion: '>=3',
      },
      '@apollo/client': { singleton: true, requiredVersion: '>=3.7.17' },
      '@orbusinfinity-shared/apollo-cache': {
        singleton: true,
        requiredVersion: '>=1.0.5',
      },
      'apollo3-cache-persist': { singleton: true, requiredVersion: '>=0.15.0' },
      graphql: { singleton: true, requiredVersion: '>=16.11.0' },
    },
  },
};

const environments = {
  development: {
    name: 'development',

    api: {
      graphqlUrl: 'http://localhost:3100/api/graphql',
    },

    features: {
      enableSourceMaps: true,
    },

    build: {
      publicPath: 'auto',
      minify: false,
      splitChunks: false,
    },

    cors: {
      origin: '*',
      allowedMethods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      allowedHeaders: 'X-Requested-With, content-type, Authorization',
      allowedHosts: Array.from(
        { length: 101 },
        (_, i) => `http://localhost:${3000 + i}`
      ),
    },
  },

  production: {
    name: 'production',

    api: {
      graphqlUrl: 'http://localhost:3100/api/graphql',
    },

    features: {
      enableSourceMaps: false,
    },

    build: {
      publicPath: 'http://localhost:8080/dist/remote-1/0.1.0/',
      minify: true,
      splitChunks: true,
    },

    cors: {
      origin: ['http://localhost:8080'],
      allowedMethods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      allowedHeaders: 'X-Requested-With, content-type, Authorization',
      allowedHosts: ['localhost'],
    },
  },
};

function getConfig(env = process.env.NODE_ENV || 'development') {
  if (!environments[env]) {
    throw new Error(
      `Environment '${env}' not found. Available environments: ${Object.keys(environments).join(', ')}`
    );
  }

  return {
    ...baseConfig,
    ...environments[env],
    environment: env,
  };
}

function getReactEnvVars(env = process.env.NODE_ENV || 'development') {
  const config = getConfig(env);

  return {
    'process.env.NODE_ENV': JSON.stringify(env),
    'process.env.REACT_APP_API_URL': JSON.stringify(config.api.graphqlUrl),
  };
}

function getCorsHeaders(env = process.env.NODE_ENV || 'development') {
  const config = getConfig(env);

  const cspOrigins = config.cors.allowedHosts;

  return {
    'Access-Control-Allow-Origin': Array.isArray(config.cors.origin)
      ? config.cors.origin.join(',')
      : config.cors.origin,
    'Access-Control-Allow-Methods': config.cors.allowedMethods,
    'Access-Control-Allow-Headers': config.cors.allowedHeaders,
    'Content-Security-Policy': [
      'frame-ancestors',
      "'self'",
      ...cspOrigins,
    ].join(' '),
  };
}

function createWebpackConfig(options = {}) {
  const env = process.env.NODE_ENV || 'development';
  const config = getConfig(env);

  return {
    definePlugin: getReactEnvVars(env),
    publicPath: config.build.publicPath,
    corsHeaders: getCorsHeaders(env),
    sharedDependencies: config.federation.shared,
    devServerPort: config.ports.dev,
    enableSourceMaps: config.features.enableSourceMaps,
    enableMinification: config.build.minify,
    enableSplitChunks: config.build.splitChunks,
    ...options,
  };
}

module.exports = {
  getConfig,
  getReactEnvVars,
  getCorsHeaders,
  createWebpackConfig,
  environments: Object.keys(environments),
  baseConfig,
};
