const buildConfig = {
  development: {
    name: 'development',
    enableSourceMaps: true,
    minify: false,
    splitChunks: false,
    port: 3002,
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
    enableSourceMaps: false,
    minify: true,
    splitChunks: true,
    port: 8080,
    cors: {
      origin: ['http://localhost:8080'],
      allowedMethods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      allowedHeaders: 'X-Requested-With, content-type, Authorization',
      allowedHosts: ['localhost'],
    },
  },
};

function getBuildConfig(env = process.env.NODE_ENV || 'development') {
  if (!buildConfig[env]) {
    throw new Error(
      `Environment '${env}' not found. Available environments: ${Object.keys(buildConfig).join(', ')}`
    );
  }

  return {
    ...buildConfig[env],
    environment: env,
  };
}

module.exports = {
  getBuildConfig,
};
