// Tipos base
export interface User {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardColumn {
  id: number;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: TaskPriority;
  status: string;
  order: number;
  columnId: number;
  createdAt: string;
  updatedAt: string;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}
export interface LoginResponse {
  token: string;
}
export interface RegisterRequest {
  username: string;
  password: string;
}
export interface RegisterResponse {
  id: number;
  username: string;
}

// Columnas
export interface CreateColumnRequest {
  name: string;
  order: number;
}
export type UpdateColumnRequest = Partial<CreateColumnRequest>;

// Tareas
export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  status: string;
  order: number;
  columnId: number;
}
export type UpdateTaskRequest = Partial<CreateTaskRequest>;
export interface MoveTaskRequest {
  newColumnId: number;
  newOrder: number;
}
