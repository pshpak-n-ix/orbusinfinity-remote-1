import { ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { CachePersistor, LocalStorageWrapper } from 'apollo3-cache-persist';
import { APOLLO_CACHE_KEY } from '../utils/constants';

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/api/graphql',
  credentials: 'same-origin',
});

export async function initializeApolloClient() {
  const cache = new InMemoryCache({
    typePolicies: {
      Todo: {
        fields: {
          dueDate: {
            merge: (_existing, incoming) => incoming as Date,
          },
        },
      },
      TodosResponse: {
        fields: {
          data: {
            merge: (_existing = [], incoming = []) => incoming as never[],
          },
        },
      },
    },
  });

  const persistor = new CachePersistor({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    key: APOLLO_CACHE_KEY,
  });

  await persistor.restore();

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === APOLLO_CACHE_KEY && (event.newValue ?? '') !== '') {
      try {
        cache.restore(JSON.parse(event.newValue ?? ''));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error restoring cache from cross-tab sync:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);

  const client = new ApolloClient({
    link: httpLink,
    cache,
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-and-network',
      },
      query: {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });

  return { client, persistor };
}

export default initializeApolloClient;
