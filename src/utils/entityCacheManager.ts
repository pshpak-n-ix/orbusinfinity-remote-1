import type { ApolloClient, DocumentNode } from '@apollo/client';

export enum DataStructure {
  PAGINATED = 'paginated',
  SIMPLE_LIST = 'simpleList',
  ARRAY = 'array',
}

export enum EntityOperationType {
  ADD = 'add',
  UPDATE = 'update',
  REMOVE = 'remove',
  REPLACE = 'replace',
  UPSERT = 'upsert',
}

export enum Position {
  START = 'start',
  END = 'end',
}

export interface EntityConfig<T = unknown> {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  queryResultKey?: string;
  dataStructure: DataStructure;
  entityName?: string;
  idField?: keyof T;
}

export interface EntityOperation<T> {
  type: EntityOperationType;
  entityKey: string;
  data?: T;
  id?: string | number;
  items?: T[];
  position?: Position;
  fieldUpdates?: Partial<T>;
}

interface PaginatedData<T> {
  data: T[];
  pagination: {
    total: number;
    [key: string]: unknown;
  };
}

interface SimpleListData<T> {
  data: T[];
  [key: string]: unknown;
}

type EntityData<T> = PaginatedData<T> | SimpleListData<T> | T[];

interface DataStrategy<T, TData = EntityData<T>> {
  add(existingData: TData, item: T, position?: Position): TData;
  update(existingData: TData, item: T, idField: keyof T): TData;
  remove(existingData: TData, id: string | number, idField: keyof T): TData;
  replace(existingData: TData, items: T[]): TData;
  upsert(existingData: TData, item: T, idField: keyof T): TData;
}

class PaginatedStrategy<T> implements DataStrategy<T, PaginatedData<T>> {
  add(
    existingData: PaginatedData<T>,
    item: T,
    position: Position = Position.START
  ): PaginatedData<T> {
    const newData =
      position === Position.START
        ? [item, ...existingData.data]
        : [...existingData.data, item];

    return {
      data: newData,
      pagination: {
        ...existingData.pagination,
        total: existingData.pagination.total + 1,
      },
    };
  }

  update(
    existingData: PaginatedData<T>,
    item: T,
    idField: keyof T
  ): PaginatedData<T> {
    return {
      data: existingData.data.map((existing: T) =>
        existing[idField] === item[idField] ? item : existing
      ),
      pagination: existingData.pagination,
    };
  }

  remove(
    existingData: PaginatedData<T>,
    id: string | number,
    idField: keyof T
  ): PaginatedData<T> {
    return {
      data: existingData.data.filter((item: T) => item[idField] !== id),
      pagination: {
        ...existingData.pagination,
        total: Math.max(0, existingData.pagination.total - 1),
      },
    };
  }

  replace(existingData: PaginatedData<T>, items: T[]): PaginatedData<T> {
    return {
      data: items,
      pagination: {
        ...existingData.pagination,
        total: items.length,
      },
    };
  }

  upsert(
    existingData: PaginatedData<T>,
    item: T,
    idField: keyof T
  ): PaginatedData<T> {
    const existingIndex = existingData.data.findIndex(
      (existing: T) => existing[idField] === item[idField]
    );

    if (existingIndex >= 0) {
      return this.update(existingData, item, idField);
    } else {
      return this.add(existingData, item);
    }
  }
}

class SimpleListStrategy<T> implements DataStrategy<T, SimpleListData<T>> {
  add(
    existingData: SimpleListData<T>,
    item: T,
    position: Position = Position.START
  ): SimpleListData<T> {
    const newData =
      position === Position.START
        ? [item, ...existingData.data]
        : [...existingData.data, item];

    return {
      ...existingData,
      data: newData,
    };
  }

  update(
    existingData: SimpleListData<T>,
    item: T,
    idField: keyof T
  ): SimpleListData<T> {
    return {
      ...existingData,
      data: existingData.data.map((existing: T) =>
        existing[idField] === item[idField] ? item : existing
      ),
    };
  }

  remove(
    existingData: SimpleListData<T>,
    id: string | number,
    idField: keyof T
  ): SimpleListData<T> {
    return {
      ...existingData,
      data: existingData.data.filter((item: T) => item[idField] !== id),
    };
  }

  replace(existingData: SimpleListData<T>, items: T[]): SimpleListData<T> {
    return {
      ...existingData,
      data: items,
    };
  }

  upsert(
    existingData: SimpleListData<T>,
    item: T,
    idField: keyof T
  ): SimpleListData<T> {
    const existingIndex = existingData.data.findIndex(
      (existing: T) => existing[idField] === item[idField]
    );

    if (existingIndex >= 0) {
      return this.update(existingData, item, idField);
    } else {
      return this.add(existingData, item);
    }
  }
}

class ArrayStrategy<T> implements DataStrategy<T, T[]> {
  add(existingData: T[], item: T, position: Position = Position.START): T[] {
    return position === Position.START
      ? [item, ...existingData]
      : [...existingData, item];
  }

  update(existingData: T[], item: T, idField: keyof T): T[] {
    return existingData.map(existing =>
      existing[idField] === item[idField] ? item : existing
    );
  }

  remove(existingData: T[], id: string | number, idField: keyof T): T[] {
    return existingData.filter(item => item[idField] !== id);
  }

  replace(_existingData: T[], items: T[]): T[] {
    return items;
  }

  upsert(existingData: T[], item: T, idField: keyof T): T[] {
    const existingIndex = existingData.findIndex(
      existing => existing[idField] === item[idField]
    );

    if (existingIndex >= 0) {
      return this.update(existingData, item, idField);
    } else {
      return this.add(existingData, item);
    }
  }
}

export class EntityCacheManager<T = unknown> {
  private readonly apolloClient: ApolloClient;
  private readonly entities: Map<string, EntityConfig<T>> = new Map();
  private readonly strategies: Map<string, DataStrategy<T, EntityData<T>>> =
    new Map();

  constructor(apolloClient: ApolloClient) {
    this.apolloClient = apolloClient;
  }

  registerEntity(entityKey: string, config: EntityConfig<T>) {
    this.entities.set(entityKey, config);

    let strategy: DataStrategy<T, EntityData<T>>;
    switch (config.dataStructure) {
      case DataStructure.PAGINATED:
        strategy = new PaginatedStrategy<T>();
        break;
      case DataStructure.SIMPLE_LIST:
        strategy = new SimpleListStrategy<T>();
        break;
      case DataStructure.ARRAY:
        strategy = new ArrayStrategy<T>();
        break;
      default:
        throw new Error(
          `Unsupported data structure: ${config.dataStructure as string}`
        );
    }

    this.strategies.set(entityKey, strategy);
  }

  async executeOperation(operation: EntityOperation<T>): Promise<boolean> {
    const config = this.entities.get(operation.entityKey);
    if (!config) {
      // eslint-disable-next-line no-console
      console.warn(`Entity config not found for key: ${operation.entityKey}`);
      return false;
    }

    const strategy = this.strategies.get(operation.entityKey);
    if (!strategy) {
      // eslint-disable-next-line no-console
      console.warn(`Strategy not found for key: ${operation.entityKey}`);
      return false;
    }

    try {
      const existingData = this.readCacheData(config);
      if (!existingData) {
        return false;
      }

      const idField = config.idField ?? ('id' as keyof T);
      let updatedData: EntityData<T>;

      switch (operation.type) {
        case EntityOperationType.ADD:
          if (!operation.data) {
            return false;
          }
          updatedData = strategy.add(
            existingData as EntityData<T>,
            operation.data,
            operation.position
          );
          break;
        case EntityOperationType.UPDATE:
          if (!operation.data) {
            return false;
          }
          updatedData = strategy.update(
            existingData as EntityData<T>,
            operation.data,
            idField
          );
          break;
        case EntityOperationType.REMOVE:
          if (operation.id === undefined) {
            return false;
          }
          updatedData = strategy.remove(
            existingData as EntityData<T>,
            operation.id,
            idField
          );
          break;
        case EntityOperationType.REPLACE:
          if (!operation.items) {
            return false;
          }
          updatedData = strategy.replace(
            existingData as EntityData<T>,
            operation.items
          );
          break;
        case EntityOperationType.UPSERT:
          if (!operation.data) {
            return false;
          }
          updatedData = strategy.upsert(
            existingData as EntityData<T>,
            operation.data,
            idField
          );
          break;
        default:
          return false;
      }

      this.writeCacheData(config, updatedData);

      if (
        operation.type === EntityOperationType.REMOVE &&
        config.entityName &&
        operation.id
      ) {
        const cacheId = this.apolloClient.cache.identify({
          __typename: config.entityName,
          [idField]: operation.id,
        });
        if (cacheId) {
          this.apolloClient.cache.evict({ id: cacheId });
        }
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Cache operation failed:', error);
      return false;
    }
  }

  getCachedData(entityKey: string): T | null {
    const config = this.entities.get(entityKey);
    if (!config) {
      return null;
    }
    return this.readCacheData(config);
  }

  private readCacheData(config: EntityConfig<T>): T | null {
    try {
      const cacheData = this.apolloClient.cache.readQuery<Record<string, T>>({
        query: config.query,
        variables: config.variables,
      });

      if (!cacheData) {
        return null;
      }

      return config.queryResultKey !== undefined &&
        config.queryResultKey.length > 0
        ? cacheData[config.queryResultKey]
        : (cacheData as unknown as T);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to read cache data:', error);
      return null;
    }
  }

  private writeCacheData(config: EntityConfig<T>, data: EntityData<T>): void {
    const cacheData =
      config.queryResultKey !== undefined && config.queryResultKey.length > 0
        ? { [config.queryResultKey]: data }
        : data;

    this.apolloClient.writeQuery({
      query: config.query,
      variables: config.variables,
      data: cacheData,
    });
  }

  destroy() {
    this.entities.clear();
    this.strategies.clear();
  }
}

export const createEntityCacheManager = <T = unknown>(
  apolloClient: ApolloClient
): EntityCacheManager<T> => {
  return new EntityCacheManager<T>(apolloClient);
};

export interface EntityCacheManagerConfig {
  enableCrossTabSync?: boolean;
  syncChannelName?: string;
}

export const createConfiguredEntityCacheManager = <T = unknown>(
  apolloClient: ApolloClient,
  _config: EntityCacheManagerConfig = {}
): EntityCacheManager<T> => {
  return new EntityCacheManager<T>(apolloClient);
};
