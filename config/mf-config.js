const mfConfig = {
  name: 'remote_app_1',
  filename: 'remoteEntry.js',
  exposes: {
    './TodoList': './src/components/TodoListWrapper',
  },
  shared: {
    '@apollo/client': { singleton: true, requiredVersion: '>=3.7.17' },
    '@fluentui/react-components': {
      singleton: true,
      requiredVersion: '>=9.68.3',
    },
    '@orbusinfinity-shared/apollo-cache': {
      singleton: true,
      requiredVersion: '>=1.0.0',
    },
    '@orbusinfinity-shared/ui-components': {
      singleton: false,
      requiredVersion: '>=1.0.0',
    },
    'apollo3-cache-persist': { singleton: true, requiredVersion: '>=0.15.0' },
    'react-dom': { singleton: true, requiredVersion: '>=18.3.1' },
    'react-router-dom': { singleton: true, requiredVersion: '>=6.29.0' },
    graphql: { singleton: true, requiredVersion: '>=16.11.0' },
    react: { singleton: true, requiredVersion: '>=18.3.1' },
  },
};

function getMfConfig() {
  return mfConfig;
}

module.exports = {
  getMfConfig,
};
