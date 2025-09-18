const { ModuleFederationPlugin } = require("webpack").container;
const { DefinePlugin } = require("webpack");
const deps = require("./package.json").dependencies;
const { createWebpackConfig } = require("./config/environments");

// Get environment-specific configuration for this project
const webpackConfig = createWebpackConfig();

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
          shared: webpackConfig.sharedDependencies,
        }),
        // Explicitly define NODE_ENV for React's build process
        new DefinePlugin(webpackConfig.definePlugin),
      ],
    },
    configure: (webpackConfig) => {
      // Set environment-specific configuration
      if (webpackConfig.isProduction) {
        webpackConfig.mode = 'production';
      }
      
      // Set environment-specific public path
      webpackConfig.output.publicPath = webpackConfig.publicPath;
      return webpackConfig;
    },
  },
  devServer: {
    // Use a different port to avoid conflicts with the shell app.
    port: webpackConfig.devServerPort,
    // CORS configuration to allow cross-origin requests for Module Federation
    headers: webpackConfig.corsHeaders,
    // Additional settings for Module Federation
    allowedHosts: "all",
  },
};