const apiConfig = {
  development: {
    graphqlUrl: 'http://localhost:3100/api/graphql',
  },

  production: {
    graphqlUrl: 'http://localhost:3100/api/graphql',
  },
};

function getApiConfig(env = process.env.NODE_ENV || 'development') {
  if (!apiConfig[env]) {
    throw new Error(
      `Environment '${env}' not found. Available environments: ${Object.keys(apiConfig).join(', ')}`
    );
  }

  return apiConfig[env];
}

module.exports = {
  getApiConfig,
};
