const { ModuleFederationPlugin } = require("webpack").container;
const { DefinePlugin } = require("webpack");
const deps = require("./package.json").dependencies;
const { createWebpackConfig } = require("./config/environments");

const webpackConfig = createWebpackConfig();

module.exports = {
  babel: {
    presets: [
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          development: false
        }
      ]
    ],
    plugins: [
      [
        '@babel/plugin-transform-react-jsx',
        {
          runtime: 'automatic',
          development: false
        }
      ]
    ]
  },
  webpack: {
    plugins: {
      add: [
        new ModuleFederationPlugin({
          name: "remote_app_1",
          filename: "remoteEntry.js",
          exposes: {
            "./Grid": "./src/components/GridMock",
            "./TodoList": "./src/components/TodoList",
          },
          shared: webpackConfig.sharedDependencies,
        }),
        new DefinePlugin(webpackConfig.definePlugin),
      ],
    },
    configure: (webpackConfig) => {
      if (webpackConfig.isProduction) {
        webpackConfig.mode = 'production';
      }
      
      webpackConfig.output.publicPath = webpackConfig.publicPath;
      return webpackConfig;
    },
  },
  devServer: {
    port: webpackConfig.devServerPort,
    headers: webpackConfig.corsHeaders,
    allowedHosts: "all",
  },
};