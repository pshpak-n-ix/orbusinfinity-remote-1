const { ModuleFederationPlugin } = require("webpack").container;
const { DefinePlugin } = require("webpack");
const deps = require("./package.json").dependencies;

module.exports = {
  babel: {
    presets: [
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          development: false  // Force production JSX transform
        }
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          development: false  // Explicitly disable development JSX
        }
      ]
    ]
  },
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          // The name of this remote application. MUST MATCH the key in the shell's 'remotes' object.
          name: "remote_app_1",
          // The manifest file that the shell will fetch.
          filename: "remoteEntry.js",
          // The list of modules this remote makes available to the shell.
          exposes: {
            // The alias on the left ('./ButtonPanel') is what the shell will use to import.
            // The path on the right ('./src/components/ButtonPanel') is the actual file path.
            "./Grid": "./src/components/GridMock",
            "./TodoList": "./src/components/TodoListWrapper",
          },
          // Shared dependencies MUST be configured identically to the shell app.
          shared: {
            react: { singleton: true, requiredVersion: ">=18.3.1" },
            "react-dom": { singleton: true, requiredVersion: ">=18.3.1" },
            "react-router-dom": { singleton: true, requiredVersion: ">=6.29.0" },
            "@fluentui/react-components": { singleton: true, requiredVersion: ">=9.68.3" },
            "@orbusinfinity-shared/ui-components": { singleton: false, requiredVersion: ">=3" },
            "@apollo/client": { singleton: true, requiredVersion: ">=3.7.17" },
            "@orbusinfinity-shared/apollo-cache": { singleton: true, requiredVersion: ">=1.0.5" },
            "apollo3-cache-persist": { singleton: true, requiredVersion: ">=0.15.0" },
            "graphql": { singleton: true, requiredVersion: ">=16.11.0" },
          },
        }),
        // Explicitly define NODE_ENV for React's build process
        new DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
      ],
    },
    configure: (webpackConfig) => {
      // Force production mode when NODE_ENV is production
      if (process.env.NODE_ENV === 'production') {
        webpackConfig.mode = 'production';
      }
      
      // Use absolute publicPath in production to ensure assets load correctly from nginx
      if (process.env.NODE_ENV === 'development') {
        webpackConfig.output.publicPath = "auto";
      } else {
        webpackConfig.output.publicPath = "http://localhost:8080/remote-1/0.1.0/";
      }
      return webpackConfig;
    },
  },
  devServer: {
    // Use a different port to avoid conflicts with the shell app.
    port: 3002,
    // CORS configuration to allow cross-origin requests for Module Federation
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      // Environment-specific CSP origins based on NODE_ENV
      'Content-Security-Policy': [
        'frame-ancestors',
        "'self'",
        ...(process.env.NODE_ENV === 'development' 
          ? Array.from({length: 101}, (_, i) => `http://localhost:${3000 + i}`)
          : ['http://localhost:8080']
        )
      ].join(' ')
    },
    // Additional settings for Module Federation
    allowedHosts: "all",
  },
};