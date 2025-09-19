const packageJson = require('../package.json');
const { getMfConfig } = require('./mf-config');
const { getApiConfig } = require('./api-config');
const { getBuildConfig } = require('./build-config');

const baseConfig = {
  appName: packageJson.name,
  displayName: 'Remote Application 1',
  version: packageJson.version,
};

function getConfig(env = process.env.NODE_ENV || 'development') {
  const mfConfig = getMfConfig();
  const apiConfig = getApiConfig(env);
  const buildConfig = getBuildConfig(env);
  
  const publicPath = env === 'development' 
    ? `http://localhost:${buildConfig.port}/`
    : `http://localhost:${buildConfig.port}/dist/${packageJson.name}/${packageJson.version}/`;

  return {
    ...baseConfig,
    ...buildConfig,
    federation: mfConfig,
    api: apiConfig,
    build: {
      publicPath,
      minify: buildConfig.minify,
      splitChunks: buildConfig.splitChunks,
    },
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
    devServerPort: config.port,
    enableSourceMaps: config.enableSourceMaps,
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
};