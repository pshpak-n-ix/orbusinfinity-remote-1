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
            ...deps,
            react: { singleton: true, requiredVersion: deps.react },
            "react-dom": { singleton: true, requiredVersion: deps["react-dom"] },
            "react-router-dom": { singleton: true, requiredVersion: deps["react-router-dom"] },
            "@fluentui/react-components": { singleton: true, requiredVersion: deps["@fluentui/react-components"] },
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
    port: 3001,
  },
};