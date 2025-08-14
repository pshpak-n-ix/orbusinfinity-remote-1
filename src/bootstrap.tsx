import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <App />
    </FluentProvider>
  </React.StrictMode>,
);

// Add this line to the end of the file.
export {};
