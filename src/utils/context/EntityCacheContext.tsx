import { createContext, useContext, useMemo, useRef, useEffect } from 'react';
import type { ApolloClient } from '@apollo/client';
import {
  type EntityCacheManager,
  createEntityCacheManager,
} from '../entityCacheManager';

interface EntityCacheContextValue {
  cacheManager: EntityCacheManager;
}

const EntityCacheContext = createContext<EntityCacheContextValue | null>(null);

interface EntityCacheProviderProps {
  children: React.ReactNode;
  apolloClient: ApolloClient;
  cacheManager?: EntityCacheManager;
}

export function EntityCacheProvider({
  children,
  apolloClient,
  cacheManager: providedCacheManager,
}: EntityCacheProviderProps) {
  const cacheManagerRef = useRef<EntityCacheManager | null>(null);

  const cacheManager = useMemo(() => {
    if (providedCacheManager) {
      return providedCacheManager;
    }

    cacheManagerRef.current ??= createEntityCacheManager(apolloClient);

    return cacheManagerRef.current;
  }, [apolloClient, providedCacheManager]);

  useEffect(() => {
    return () => {
      if (cacheManagerRef.current && !providedCacheManager) {
        cacheManagerRef.current.destroy();
        cacheManagerRef.current = null;
      }
    };
  }, [providedCacheManager]);

  const contextValue = useMemo(
    () => ({
      cacheManager,
    }),
    [cacheManager]
  );

  return (
    <EntityCacheContext.Provider value={contextValue}>
      {children}
    </EntityCacheContext.Provider>
  );
}

export function useEntityCacheManager(): EntityCacheManager {
  const context = useContext(EntityCacheContext);

  if (!context) {
    throw new Error(
      'useEntityCacheManager must be used within an EntityCacheProvider. ' +
        'Make sure your component is wrapped with EntityCacheProvider.'
    );
  }

  return context.cacheManager;
}

export function useEntityCacheManagerOptional(): EntityCacheManager | null {
  const context = useContext(EntityCacheContext);
  return context?.cacheManager ?? null;
}

export function withEntityCacheManager<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(
    props: P & {
      apolloClient: ApolloClient;
    }
  ) {
    const { apolloClient, ...restProps } = props;

    return (
      <EntityCacheProvider apolloClient={apolloClient}>
        <Component {...(restProps as P)} />
      </EntityCacheProvider>
    );
  };
}
