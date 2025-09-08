export enum TodoPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TodoSortField {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TITLE = 'TITLE',
  PRIORITY = 'PRIORITY',
  DUE_DATE = 'DUE_DATE',
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TodoPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodosResponse {
  data: Todo[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TodoPriority;
  dueDate?: string;
}

export interface TodoFilterInput {
  completed?: boolean;
  priority?: TodoPriority;
  search?: string;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  sortBy?: TodoSortField;
  sortOrder?: 'asc' | 'desc';
}
