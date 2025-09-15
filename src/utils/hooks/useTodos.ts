import { useMemo } from 'react';
import { GET_TODOS, TodoSortField } from '../../apollo/operations';
import type { Todo } from '../../apollo/types';
import { DataStructure, useEntity } from '@orbusinfinity-shared/apollo-cache';

export const DEFAULT_TODOS_VARIABLES = {
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

export function useTodos(
  variables: Record<string, unknown> = DEFAULT_TODOS_VARIABLES
) {
  const entityKey = useMemo(() => {
    return `todos:${JSON.stringify(variables)}`;
  }, [variables]);

  const {
    loading,
    error,
    data,
    refresh,
    addEntity: addTodo,
    updateEntity: updateTodo,
    removeEntity: removeTodo,
    upsertEntity: upsertTodo,
    replaceEntities: replaceTodos,
    updateEntityFields: updateTodoFields,
  } = useEntity<TodosQueryData, Todo>(entityKey, GET_TODOS, {
    variables,
    config: {
      queryResultKey: 'todos',
      dataStructure: DataStructure.PAGINATED,
      entityName: 'Todo',
    },
    queryOptions: {
      errorPolicy: 'all',
    },
  });

  const todos = data?.todos.data ?? [];
  const pagination = data?.todos.pagination;

  return {
    loading,
    error,
    todos,
    pagination,
    refresh,
    entityKey,

    addTodo,
    updateTodo,
    removeTodo,
    upsertTodo,
    replaceTodos,
    updateTodoFields,
  };
}

export function useTodoEvents(
  variables: Record<string, unknown> = DEFAULT_TODOS_VARIABLES
) {
  const entityKey = useMemo(() => {
    return `todos:${JSON.stringify(variables)}`;
  }, [variables]);

  return { entityKey };
}

export function useTodoMutations(
  variables: Record<string, unknown> = DEFAULT_TODOS_VARIABLES
) {
  const entityKey = useMemo(() => {
    return `todos:${JSON.stringify(variables)}`;
  }, [variables]);

  return { entityKey };
}
