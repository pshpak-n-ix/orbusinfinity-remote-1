import { gql } from '@apollo/client';

// Re-export types for convenience
export * from './types';

// GraphQL Queries
export const GET_TODOS = gql`
  query GetTodos($filters: TodoFilterInput, $pagination: PaginationInput) {
    todos(filters: $filters, pagination: $pagination) {
      data {
        id
        title
        description
        completed
        priority
        dueDate
        createdAt
        updatedAt
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_TODO_BY_ID = gql`
  query GetTodoById($id: ID!) {
    todo(id: $id) {
      id
      title
      description
      completed
      priority
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const GET_TODO_STATS = gql`
  query GetTodoStats {
    todoStats {
      total
      completed
      pending
      overdue
      byPriority {
        low
        medium
        high
        urgent
      }
    }
  }
`;

// GraphQL Mutations
export const CREATE_TODO = gql`
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      id
      title
      description
      completed
      priority
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TODO = gql`
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      title
      description
      completed
      priority
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      success
      message
    }
  }
`;

export const MARK_TODO_COMPLETED = gql`
  mutation MarkTodoCompleted($id: ID!) {
    markTodoCompleted(id: $id) {
      id
      title
      description
      completed
      priority
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const MARK_TODO_INCOMPLETE = gql`
  mutation MarkTodoIncomplete($id: ID!) {
    markTodoIncomplete(id: $id) {
      id
      title
      description
      completed
      priority
      dueDate
      createdAt
      updatedAt
    }
  }
`;

export const FORCE_SYNC = gql`
  mutation ForceSync {
    forceSync {
      success
      message
    }
  }
`;
