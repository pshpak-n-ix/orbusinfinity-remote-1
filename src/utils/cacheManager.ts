import type { ApolloCache, ApolloClient, DocumentNode } from '@apollo/client';

export enum DataStructure {
  PAGINATED = 'paginated',
  SIMPLE_LIST = 'simpleList',
  ARRAY = 'array',
}

export enum CacheOperationType {
  ADD = 'add',
  UPDATE = 'update',
  REMOVE = 'remove',
  REPLACE = 'replace',
  UPSERT = 'upsert',
}

export interface PaginatedData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SimpleListData<T> {
  data: T[];
}

export type QueryData<T> = PaginatedData<T> | SimpleListData<T> | T[];

export interface CacheConfig<T = Record<string, unknown>> {
  query: DocumentNode;
  variables?: Record<string, unknown>;
  queryResultKey?: string;
  dataStructure: DataStructure;
  entityName?: string;
  idField?: keyof T;
}

export type CacheOperation<T> =
  | { type: CacheOperationType.ADD; item: T; position?: 'start' | 'end' }
  | { type: CacheOperationType.UPDATE; item: T }
  | { type: CacheOperationType.REMOVE; id: string | number }
  | { type: CacheOperationType.REPLACE; items: T[] }
  | { type: CacheOperationType.UPSERT; item: T };

export interface CacheStrategy<T> {
  add(
    existingData: QueryData<T>,
    item: T,
    position?: 'start' | 'end'
  ): QueryData<T>;
  update(existingData: QueryData<T>, item: T, idField: keyof T): QueryData<T>;
  remove(
    existingData: QueryData<T>,
    id: string | number,
    idField: keyof T
  ): QueryData<T>;
  replace(existingData: QueryData<T>, items: T[]): QueryData<T>;
  upsert(existingData: QueryData<T>, item: T, idField: keyof T): QueryData<T>;
}

class PaginatedStrategy<T> implements CacheStrategy<T> {
  add(
    existingData: PaginatedData<T>,
    item: T,
    position: 'start' | 'end' = 'start'
  ): PaginatedData<T> {
    const newData =
      position === 'start'
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
      data: existingData.data.map(existing =>
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
      data: existingData.data.filter(item => item[idField] !== id),
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
      existing => existing[idField] === item[idField]
    );

    if (existingIndex >= 0) {
      return this.update(existingData, item, idField);
    } else {
      return this.add(existingData, item);
    }
  }
}

class SimpleListStrategy<T> implements CacheStrategy<T> {
  add(
    existingData: SimpleListData<T>,
    item: T,
    position: 'start' | 'end' = 'start'
  ): SimpleListData<T> {
    const newData =
      position === 'start'
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
      data: existingData.data.map(existing =>
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
      data: existingData.data.filter(item => item[idField] !== id),
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
      existing => existing[idField] === item[idField]
    );

    if (existingIndex >= 0) {
      return this.update(existingData, item, idField);
    } else {
      return this.add(existingData, item);
    }
  }
}

class ArrayStrategy<T> implements CacheStrategy<T> {
  add(existingData: T[], item: T, position: 'start' | 'end' = 'start'): T[] {
    return position === 'start'
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

export class OptimisticCacheManager<T extends Record<string, unknown>> {
  private readonly cache: ApolloCache;
  private readonly config: CacheConfig<T>;
  private readonly strategy: CacheStrategy<T>;
  private readonly idField: keyof T;

  constructor(apolloClient: ApolloClient, config: CacheConfig<T>) {
    this.cache = apolloClient.cache;
    this.config = config;
    this.idField = config.idField ?? ('id' as keyof T);

    switch (config.dataStructure) {
      case DataStructure.PAGINATED:
        this.strategy = new PaginatedStrategy<T>();
        break;
      case DataStructure.SIMPLE_LIST:
        this.strategy = new SimpleListStrategy<T>();
        break;
      case DataStructure.ARRAY:
        this.strategy = new ArrayStrategy<T>();
        break;
      default:
        throw new Error(
          `Unsupported data structure: ${config.dataStructure as string}`
        );
    }
  }

  async executeOperation(operation: CacheOperation<T>): Promise<boolean> {
    try {
      const existingData = this.readCacheData();
      if (!existingData) {
        return false;
      }

      const updatedData = this.applyOperation(existingData, operation);
      this.writeCacheData(updatedData);

      if (
        operation.type === CacheOperationType.REMOVE &&
        this.config.entityName !== undefined &&
        this.config.entityName.length > 0
      ) {
        const cacheId = this.cache.identify({
          __typename: this.config.entityName,
          [this.idField]: operation.id,
        });
        if (cacheId !== undefined) {
          this.cache.evict({ id: cacheId });
        }
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Optimistic cache update failed:', error);
      return false;
    }
  }

  async addItem(
    item: T,
    position: 'start' | 'end' = 'start'
  ): Promise<boolean> {
    return this.executeOperation({
      type: CacheOperationType.ADD,
      item,
      position,
    });
  }

  async updateItem(item: T): Promise<boolean> {
    return this.executeOperation({ type: CacheOperationType.UPDATE, item });
  }

  async removeItem(id: string | number): Promise<boolean> {
    return this.executeOperation({ type: CacheOperationType.REMOVE, id });
  }

  async upsertItem(item: T): Promise<boolean> {
    return this.executeOperation({ type: CacheOperationType.UPSERT, item });
  }

  async replaceItems(items: T[]): Promise<boolean> {
    return this.executeOperation({ type: CacheOperationType.REPLACE, items });
  }

  async updateItemField(
    id: string | number,
    fieldUpdates: Partial<T>
  ): Promise<boolean> {
    try {
      if (
        this.config.entityName === undefined ||
        this.config.entityName.length === 0
      ) {
        // eslint-disable-next-line no-console
        console.warn('Entity name required for field updates');
        return false;
      }

      const cacheId = this.cache.identify({
        __typename: this.config.entityName,
        [this.idField]: id,
      });

      if (cacheId === undefined) {
        // eslint-disable-next-line no-console
        console.warn('Could not identify cache entry for field update');
        return false;
      }

      this.cache.modify({
        id: cacheId,
        fields: Object.keys(fieldUpdates).reduce(
          (acc, key) => {
            acc[key] = () => fieldUpdates[key as keyof T];
            return acc;
          },
          {} as Record<string, () => unknown>
        ),
      });

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to update item field:', error);
      return false;
    }
  }

  private readCacheData(): QueryData<T> | null {
    try {
      const cacheData = this.cache.readQuery<Record<string, QueryData<T>>>({
        query: this.config.query,
        variables: this.config.variables,
      });

      if (cacheData === null) {
        return null;
      }

      return this.config.queryResultKey !== undefined &&
        this.config.queryResultKey.length > 0
        ? cacheData[this.config.queryResultKey]
        : (cacheData as unknown as QueryData<T>);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Failed to read cache data:', error);
      return null;
    }
  }

  private writeCacheData(data: QueryData<T>): void {
    const cacheData =
      this.config.queryResultKey !== undefined &&
      this.config.queryResultKey.length > 0
        ? { [this.config.queryResultKey]: data }
        : data;

    this.cache.writeQuery({
      query: this.config.query,
      variables: this.config.variables,
      data: cacheData,
    });
  }

  private applyOperation(
    existingData: QueryData<T>,
    operation: CacheOperation<T>
  ): QueryData<T> {
    switch (operation.type) {
      case CacheOperationType.ADD:
        return this.strategy.add(
          existingData,
          operation.item,
          operation.position
        );
      case CacheOperationType.UPDATE:
        return this.strategy.update(existingData, operation.item, this.idField);
      case CacheOperationType.REMOVE:
        return this.strategy.remove(existingData, operation.id, this.idField);
      case CacheOperationType.REPLACE:
        return this.strategy.replace(existingData, operation.items);
      case CacheOperationType.UPSERT:
        return this.strategy.upsert(existingData, operation.item, this.idField);
      default:
        return existingData;
    }
  }

  createMutationCallbacks() {
    return {
      onCreateCompleted: (data: { [key: string]: T }) => {
        const [createdItem] = Object.values(data);
        this.addItem(createdItem);
      },

      onUpdateCompleted: (data: { [key: string]: T }) => {
        const [updatedItem] = Object.values(data);
        this.updateItem(updatedItem);
      },

      onDeleteCompleted: (_data: unknown, variables?: { id: string }) => {
        if (variables?.id !== undefined && variables.id.length > 0) {
          void this.removeItem(variables.id);
        }
      },
    };
  }
}
