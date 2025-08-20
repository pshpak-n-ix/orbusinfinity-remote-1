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
    // CORS configuration to allow cross-origin requests for Module Federation
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      // Allow framing from development ports 3000-3100 for iframe compatibility
      'Content-Security-Policy': [
        'frame-ancestors',
        "'self'",
        ...Array.from({length: 101}, (_, i) => `http://localhost:${3000 + i}`)
      ].join(' ')
    },
    // Additional settings for Module Federation
    allowedHosts: "all",
  },
};