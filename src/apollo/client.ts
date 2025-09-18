import {
  initializeApolloClient as initApolloClient,
  createApolloClientConfig,
  DEFAULT_APOLLO_CACHE_KEY,
} from '@orbusinfinity-shared/apollo-cache';

export async function initializeApolloClient() {
  const apiUrl =
    process.env.REACT_APP_API_URL ?? 'http://localhost:3100/api/graphql';
  const config = createApolloClientConfig(apiUrl, {
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
