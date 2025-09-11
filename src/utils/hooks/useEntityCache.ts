import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useQuery, useApolloClient } from '@apollo/client/react';
import type { DocumentNode, OperationVariables } from '@apollo/client';
import {
  type EntityConfig,
  type EntityOperation,
  EntityOperationType,
  Position,
} from '../entityCacheManager';
import { useEntityCacheManager } from '../context/EntityCacheContext';
import { APOLLO_CACHE_KEY } from '../constants';

export function useContextEntityData<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  entityKey: string,
  query: DocumentNode,
  options: {
    variables?: TVariables;
    config: Omit<EntityConfig<TData>, 'query' | 'variables'>;
    queryOptions?: Record<string, unknown>;
  }
) {
  const cacheManager = useEntityCacheManager();

  useMemo(() => {
    cacheManager.registerEntity(entityKey, {
      query,
      variables: options.variables,
      ...options.config,
    } as EntityConfig);
  }, [cacheManager, entityKey, query, options.variables, options.config]);

  const queryResult = useQuery<TData, TVariables>(query, {
    variables: options.variables as TVariables,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    ...options.queryOptions,
  });

  const refresh = useCallback(
    async (networkOnly = false) => {
      try {
        let dataToBroadcast: TData | null = null;
        if (networkOnly) {
          const { data } = await queryResult.client.query<TData>({
            query,
            variables: options.variables,
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
          });
          dataToBroadcast = data ?? null;
        } else {
          dataToBroadcast = queryResult.client.readQuery<TData>({
            query,
            variables: options.variables,
          });
        }

        if (dataToBroadcast !== null) {
          queryResult.client.writeQuery({
            query,
            variables: options.variables,
            data: dataToBroadcast,
          });
        }
      } catch (_error) {}
    },
    [query, options.variables, queryResult]
  );

  const waitingForStorageRef = useRef(false);

  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;

    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel('entity-cache-sync');

      const handleBroadcastMessage = (event: MessageEvent) => {
        const eventData = event.data as {
          type?: string;
          entityKey?: string;
          operationType?: string;
          timestamp?: number;
        };

        if (
          eventData.type === 'cache-update' &&
          eventData.entityKey === entityKey
        ) {
          // Set flag to start waiting for storage event
          waitingForStorageRef.current = true;
        }
      };

      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (waitingForStorageRef.current && event.key === APOLLO_CACHE_KEY) {
        // Reset flag and trigger refresh
        waitingForStorageRef.current = false;
        refresh(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      window.removeEventListener('storage', handleStorageChange);
      waitingForStorageRef.current = false;
    };
  }, [entityKey, refresh]);

  return {
    ...queryResult,
    refresh,
    entityKey,
  };
}

export function useContextEntityMutations<TEntity = unknown>(
  entityKey: string
) {
  const cacheManager = useEntityCacheManager();
  const apolloClient = useApolloClient();

  const addEntity = useCallback(
    async (
      entity: TEntity,
      position: Position = Position.START
    ): Promise<boolean> => {
      const operation: EntityOperation<TEntity> = {
        type: EntityOperationType.ADD,
        entityKey,
        data: entity,
        position,
      };
      return cacheManager.executeOperation(operation);
    },
    [cacheManager, entityKey]
  );

  const updateEntity = useCallback(
    async (entity: TEntity): Promise<boolean> => {
      const operation: EntityOperation<TEntity> = {
        type: EntityOperationType.UPDATE,
        entityKey,
        data: entity,
      };
      return cacheManager.executeOperation(operation);
    },
    [cacheManager, entityKey]
  );

  const removeEntity = useCallback(
    async (id: string | number): Promise<boolean> => {
      const operation: EntityOperation<TEntity> = {
        type: EntityOperationType.REMOVE,
        entityKey,
        id,
      };
      return cacheManager.executeOperation(operation);
    },
    [cacheManager, entityKey]
  );

  const upsertEntity = useCallback(
    async (entity: TEntity): Promise<boolean> => {
      const operation: EntityOperation<TEntity> = {
        type: EntityOperationType.UPSERT,
        entityKey,
        data: entity,
      };
      return cacheManager.executeOperation(operation);
    },
    [cacheManager, entityKey]
  );

  const replaceEntities = useCallback(
    async (entities: TEntity[]): Promise<boolean> => {
      const operation: EntityOperation<TEntity> = {
        type: EntityOperationType.REPLACE,
        entityKey,
        items: entities,
      };
      return cacheManager.executeOperation(operation);
    },
    [cacheManager, entityKey]
  );

  const updateEntityFields = useCallback(
    async (
      id: string | number,
      fieldUpdates: Partial<TEntity>
    ): Promise<boolean> => {
      const cachedData = cacheManager.getCachedData(entityKey);
      if (cachedData === null || cachedData === undefined) {
        return false;
      }

      try {
        const result = apolloClient.cache.modify({
          id: apolloClient.cache.identify({ __typename: 'Todo', id }),
          fields: Object.keys(fieldUpdates).reduce(
            (acc, key) => {
              acc[key] = () => fieldUpdates[key as keyof TEntity];
              return acc;
            },
            {} as Record<string, () => unknown>
          ),
        });
        return result;
      } catch (_error) {
        return false;
      }
    },
    [cacheManager, entityKey, apolloClient]
  );

  return {
    addEntity,
    updateEntity,
    removeEntity,
    upsertEntity,
    replaceEntities,
    updateEntityFields,
  };
}

export function useContextEntity<
  TData = unknown,
  TEntity = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  entityKey: string,
  query: DocumentNode,
  options: {
    variables?: TVariables;
    config: Omit<EntityConfig<TData>, 'query' | 'variables'>;
    queryOptions?: Record<string, unknown>;
  }
) {
  const dataHook = useContextEntityData<TData, TVariables>(
    entityKey,
    query,
    options
  );
  const mutationsHook = useContextEntityMutations<TEntity>(entityKey);

  return {
    ...dataHook,
    ...mutationsHook,
  };
}
