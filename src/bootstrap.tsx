import { useState, useEffect, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { type ApolloClient } from '@apollo/client';
import { initializeApolloClient } from './apollo/client';
import App from './App';
import './index.css';

function AppInitializer() {
  const [client, setClient] = useState<ApolloClient | null>(null);

  useEffect(() => {
    initializeApolloClient().then(({ client: initializedClient }) => {
      setClient(initializedClient);
    });
  }, []);

  if (!client) {
    // You can render a loading spinner or splash screen here
    return <div>Loading...</div>;
  }

  return <App client={client} />;
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <AppInitializer />
  </StrictMode>
);

// Add this line to the end of the file.
export {};
