import { useState, useCallback } from 'react';
import { useQuery, useApolloClient } from '@apollo/client/react';
import type { DocumentNode } from '@apollo/client';

interface UseQueryWithRefreshOptions {
  variables?: Record<string, unknown>;
  errorPolicy?: 'none' | 'ignore' | 'all';
}

interface UseQueryWithRefreshResult<TData> {
  loading: boolean;
  error: unknown;
  data: TData | undefined;
  load: (forceRefresh?: boolean) => Promise<void>;
}

export const useQueryWithRefresh = <TData = unknown>(
  query: DocumentNode,
  options: UseQueryWithRefreshOptions = {}
): UseQueryWithRefreshResult<TData> => {
  const { variables, errorPolicy = 'all' } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const apolloClient = useApolloClient();

  const {
    loading: queryLoading,
    error,
    data,
  } = useQuery<TData>(query, {
    variables,
    errorPolicy,
    fetchPolicy: 'cache-first',
  });

  const load = useCallback(
    async (forceRefresh = false) => {
      setIsRefreshing(true);
      try {
        if (forceRefresh) {
          // Force refresh - always fetch from network
          await apolloClient.query({
            query,
            variables,
            fetchPolicy: 'network-only',
            errorPolicy,
          });
        } else {
          // Regular load - check cache first
          try {
            const cachedData = apolloClient.cache.readQuery({
              query,
              variables,
            });

            if (cachedData !== null && cachedData !== undefined) {
              return;
            }
          } catch (_cacheError) {}

          await apolloClient.query({
            query,
            variables,
            fetchPolicy: 'network-only',
            errorPolicy,
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading data:', err);
        throw err;
      } finally {
        setIsRefreshing(false);
      }
    },
    [apolloClient, query, variables, errorPolicy]
  );

  return {
    loading: queryLoading || isRefreshing,
    error,
    data,
    load,
  };
};
