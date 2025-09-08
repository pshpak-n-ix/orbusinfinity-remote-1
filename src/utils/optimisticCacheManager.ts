export {
  DataStructure,
  CacheOperationType,
  type PaginatedData,
  type SimpleListData,
  type QueryData,
  type CacheConfig,
  type CacheOperation,
  type CacheStrategy,
  OptimisticCacheManager,
} from './cacheManager';

export {
  DEFAULT_TODOS_QUERY_VARIABLES,
  type TodosQueryData,
  createTodosCacheManager,
} from './todoCacheUtils';

export { useOptimisticCache } from './hooks/useOptimisticCache';
