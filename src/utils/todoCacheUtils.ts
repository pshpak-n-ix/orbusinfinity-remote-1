import type { ApolloCache, ApolloClient, DocumentNode } from '@apollo/client';
import { GET_TODOS, TodoSortField } from '../apollo/operations';
import type { Todo } from '../apollo/types';
import { OptimisticCacheManager, DataStructure } from './cacheManager';

export const DEFAULT_TODOS_QUERY_VARIABLES = {
  pagination: {
    page: 1,
    limit: 50,
    sortBy: TodoSortField.CREATED_AT,
    sortOrder: 'desc' as const,
  },
};

export interface TodosQueryData {
  todos: {
    data: Todo[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const createTodosCacheManager = (
  apolloClient: ApolloClient,
  query: DocumentNode,
  variables?: Record<string, unknown>
) => {
  return new OptimisticCacheManager(apolloClient, {
    query,
    variables,
    queryResultKey: 'todos',
    dataStructure: DataStructure.PAGINATED,
    entityName: 'Todo',
    idField: 'id',
  });
};

// Legacy cache utility functions for backward compatibility
/**
 * Add a new todo to the cache
 */
export const addTodoToCache = (
  cache: ApolloCache,
  newTodo: Todo,
  queryVariables = DEFAULT_TODOS_QUERY_VARIABLES
): boolean => {
  try {
    const existingData = cache.readQuery<TodosQueryData>({
      query: GET_TODOS,
      variables: queryVariables,
    });

    if (existingData) {
      cache.writeQuery({
        query: GET_TODOS,
        variables: queryVariables,
        data: {
          todos: {
            ...existingData.todos,
            data: [newTodo, ...existingData.todos.data],
            pagination: {
              ...existingData.todos.pagination,
              total: existingData.todos.pagination.total + 1,
            },
          },
        },
      });
      return true;
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to add todo to cache:', error);
    return false;
  }
};

/**
 * Remove a todo from the cache
 */
export const removeTodoFromCache = (
  cache: ApolloCache,
  todoId: string,
  queryVariables = DEFAULT_TODOS_QUERY_VARIABLES
): boolean => {
  try {
    const existingData = cache.readQuery<TodosQueryData>({
      query: GET_TODOS,
      variables: queryVariables,
    });

    if (existingData) {
      cache.writeQuery({
        query: GET_TODOS,
        variables: queryVariables,
        data: {
          todos: {
            ...existingData.todos,
            data: existingData.todos.data.filter(
              (item: Todo) => item.id !== todoId
            ),
            pagination: {
              ...existingData.todos.pagination,
              total: Math.max(0, existingData.todos.pagination.total - 1),
            },
          },
        },
      });

      // Also evict the individual todo from cache
      cache.evict({
        id: cache.identify({ __typename: 'Todo', id: todoId }),
      });

      return true;
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to remove todo from cache:', error);
    return false;
  }
};

/**
 * Update a todo in the cache using cache.modify
 */
export const updateTodoInCache = (
  cache: ApolloCache,
  updatedTodo: Todo
): boolean => {
  try {
    cache.modify({
      id: cache.identify({ __typename: 'Todo', id: updatedTodo.id }),
      fields: {
        title: () => updatedTodo.title,
        description: () => updatedTodo.description,
        completed: () => updatedTodo.completed,
        priority: () => updatedTodo.priority,
        dueDate: () => updatedTodo.dueDate,
        updatedAt: () => updatedTodo.updatedAt,
      },
    });
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to update todo in cache:', error);
    return false;
  }
};
