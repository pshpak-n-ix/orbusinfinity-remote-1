const { ModuleFederationPlugin } = require("webpack").container;
const deps = require("./package.json").dependencies;

module.exports = {
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
          },
          // Shared dependencies MUST be configured identically to the shell app.
          shared: {
            react: { singleton: true, requiredVersion: ">=18.3.1" },
            "react-dom": { singleton: true, requiredVersion: ">=18.3.1" },
            "react-router-dom": { singleton: true, requiredVersion: ">=6.29.0" },
            "@fluentui/react-components": { singleton: true, requiredVersion: ">=9.68.3" },
            "@orbusinfinity-shared/ui-components": { singleton: false, requiredVersion: ">=0.0.101 & <1" },
          },
        }),
      ],
    },
    configure: (webpackConfig) => {
      webpackConfig.output.publicPath = "auto";
      return webpackConfig;
    },
  },
  devServer: {
    // Use a different port to avoid conflicts with the shell app.
    port: 3002,
  },
};