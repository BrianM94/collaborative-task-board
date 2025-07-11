import { create } from "zustand";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  MoveTaskRequest,
} from "../types/kanban";
import * as taskService from "../services/taskService";

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (
    token: string,
    filter?: { status?: string; priority?: string }
  ) => Promise<void>;
  createTask: (data: CreateTaskRequest, token: string) => Promise<void>;
  updateTask: (
    id: number,
    data: UpdateTaskRequest,
    token: string
  ) => Promise<void>;
  deleteTask: (id: number, token: string) => Promise<void>;
  moveTask: (id: number, data: MoveTaskRequest, token: string) => Promise<void>;
}

export const useTasks = create<TasksState>((set) => ({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async (token, filter) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getTasks(token, filter);
      set({ tasks, loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
  createTask: async (data, token) => {
    set({ loading: true, error: null });
    try {
      await taskService.createTask(data, token);
      set({ loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
  updateTask: async (id, data, token) => {
    set({ loading: true, error: null });
    try {
      await taskService.updateTask(id, data, token);
      set({ loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
  deleteTask: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await taskService.deleteTask(id, token);
      set({ loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
  moveTask: async (id, data, token) => {
    set({ loading: true, error: null });
    try {
      await taskService.moveTask(id, data, token);
      set({ loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
}));
