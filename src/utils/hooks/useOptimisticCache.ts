import { useMemo } from 'react';
import { useApolloClient } from '@apollo/client/react';
import {
  OptimisticCacheManager,
  type CacheConfig,
  type CacheOperation,
} from '../cacheManager';

export const useOptimisticCache = <T extends Record<string, unknown>>(
  config: CacheConfig<T>
) => {
  const apolloClient = useApolloClient();

  const cacheManager = useMemo(
    () => new OptimisticCacheManager<T>(apolloClient, config),
    [apolloClient, config]
  );

  const operations = useMemo(
    () => ({
      addItem: (item: T, position: 'start' | 'end' = 'start') =>
        cacheManager.addItem(item, position),

      updateItem: (item: T) => cacheManager.updateItem(item),

      removeItem: (id: string | number) => cacheManager.removeItem(id),

      upsertItem: (item: T) => cacheManager.upsertItem(item),

      replaceItems: (items: T[]) => cacheManager.replaceItems(items),

      updateItemField: (id: string | number, fieldUpdates: Partial<T>) =>
        cacheManager.updateItemField(id, fieldUpdates),

      executeOperation: (operation: CacheOperation<T>) =>
        cacheManager.executeOperation(operation),
    }),
    [cacheManager]
  );

  const mutationCallbacks = useMemo(
    () => cacheManager.createMutationCallbacks(),
    [cacheManager]
  );

  return {
    ...operations,
    ...mutationCallbacks,
  };
};
