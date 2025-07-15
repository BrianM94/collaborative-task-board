import { create } from "zustand";
import { arrayMove } from "@dnd-kit/sortable";
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/kanban";
import * as taskService from "../services/taskService";

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (token: string, filter?: { status?: string; priority?: string }) => Promise<void>;
  createTask: (data: CreateTaskRequest, token: string) => Promise<void>;
  updateTask: (id: number, data: UpdateTaskRequest, token: string) => Promise<void>;
  deleteTask: (id: number, token: string) => Promise<void>;
  reorderTasks: (activeId: number, overId: number, token: string) => Promise<void>;
  moveTask: (taskId: number, newColumnId: number, newOrder: number, token: string) => Promise<void>;
  setTasks: (updater: Task[] | ((tasks: Task[]) => Task[])) => void;
}

export const useTasks = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  setTasks: (updater) => set((state) => ({
    tasks: typeof updater === 'function' ? updater(state.tasks) : updater,
  })),

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
    try {
      const newTask = await taskService.createTask(data, token);
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message });
    }
  },

  updateTask: async (id, data, token) => {
    try {
      const updatedTask = await taskService.updateTask(id, data, token);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
      }));
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message });
    }
  },

  deleteTask: async (id, token) => {
    try {
      await taskService.deleteTask(id, token);
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message });
    }
  },

  reorderTasks: async (activeId, overId, token) => {
    const { tasks } = get();
    const originalTasks = [...tasks];
    
    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);
    
    if (!activeTask || !overTask) {
      return;
    }

    if (activeTask.columnId !== overTask.columnId) {
      return;
    }

    const columnTasks = tasks
      .filter(t => t.columnId === activeTask.columnId)
      .sort((a, b) => a.order - b.order);
    
    const activeIndex = columnTasks.findIndex(t => t.id === activeId);
    const overIndex = columnTasks.findIndex(t => t.id === overId);

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    const reorderedColumnTasks = arrayMove(columnTasks, activeIndex, overIndex);
    
    const tasksWithNewOrder = reorderedColumnTasks.map((task, index) => ({
      ...task,
      order: index
    }));

    const otherTasks = tasks.filter(t => t.columnId !== activeTask.columnId);
    const newTasks = [...otherTasks, ...tasksWithNewOrder];
    
    set({ tasks: newTasks });

    try {
      const payload = tasksWithNewOrder.map((task, index) => ({
        id: task.id,
        order: index,
        columnId: task.columnId,
      }));
      
      await taskService.reorderTasks(payload, token);
      
      const refreshedTasks = await taskService.getTasks(token);
      set({ tasks: refreshedTasks });
      
    } catch (e: unknown) {
      const error = e as Error;
      set({ tasks: originalTasks, error: error.message });
    }
  },

  moveTask: async (taskId, newColumnId, newOrder, token) => {
    const { tasks } = get();
    const originalTasks = [...tasks];
    

    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove) {
      return;
    }

    const updatedTasks = tasks.map(t => 
      t.id === taskId 
        ? { ...t, columnId: newColumnId }
        : t
    );

    set({ tasks: updatedTasks });

    try {
      await taskService.moveTask(taskId, { newColumnId, newOrder }, token);
      
      const refreshedTasks = await taskService.getTasks(token);
      set({ tasks: refreshedTasks });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, tasks: originalTasks });
    }
  },
}));