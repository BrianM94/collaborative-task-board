import { create } from "zustand";
import type {
  BoardColumn,
  CreateColumnRequest,
  UpdateColumnRequest,
} from "../types/kanban";
import * as columnService from "../services/columnService";

interface ColumnsState {
  columns: BoardColumn[];
  loading: boolean;
  error: string | null;
  fetchColumns: (token: string) => Promise<void>;
  createColumn: (data: CreateColumnRequest, token: string) => Promise<void>;
  updateColumn: (
    id: number,
    data: UpdateColumnRequest,
    token: string
  ) => Promise<void>;
  deleteColumn: (id: number, token: string) => Promise<void>;
}

export const useColumns = create<ColumnsState>((set) => ({
  columns: [],
  loading: false,
  error: null,
  fetchColumns: async (token) => {
    set({ loading: true, error: null });
    try {
      const columns = await columnService.getColumns(token);
      set({ columns, loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
  createColumn: async (data, token) => {
    set({ loading: true, error: null });
    try {
      await columnService.createColumn(data, token);
      set({ loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
  updateColumn: async (id, data, token) => {
    set({ loading: true, error: null });
    try {
      await columnService.updateColumn(id, data, token);
      set({ loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
  deleteColumn: async (id, token) => {
    set({ loading: true, error: null });
    try {
      await columnService.deleteColumn(id, token);
      set({ loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },
}));
