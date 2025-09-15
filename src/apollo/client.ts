import {
  initializeApolloClient as initApolloClient,
  createApolloClientConfig,
  DEFAULT_APOLLO_CACHE_KEY,
} from '@orbusinfinity-shared/apollo-cache';

export async function initializeApolloClient() {
  const config = createApolloClientConfig('http://localhost:8080/api/graphql', {
    cacheKey: DEFAULT_APOLLO_CACHE_KEY,
    typePolicies: {
      Todo: {
        fields: {
          dueDate: {
            merge: (_existing: Date | undefined, incoming: Date) => incoming,
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

  return await initApolloClient(config);
}

export default initializeApolloClient;
