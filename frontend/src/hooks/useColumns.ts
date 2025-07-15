import { create } from "zustand";
import type {
  BoardColumn,
  CreateColumnRequest,
  UpdateColumnRequest,
} from "../types/kanban";
import * as columnService from "../services/columnService";
import { arrayMove } from "@dnd-kit/sortable";

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
  reorderColumns: (activeId: number, overId: number, token: string) => Promise<void>;
  setColumns: (columns: BoardColumn[]) => void;
}

export const useColumns = create<ColumnsState>((set, get) => ({
  columns: [],
  loading: false,
  error: null,

  setColumns: (columns) => set({ columns }),

  fetchColumns: async (token) => {
    set({ loading: true, error: null });
    try {
      const columns = await columnService.getColumns(token);
      set({ columns: columns.sort((a, b) => a.order - b.order), loading: false });
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, loading: false });
    }
  },

  createColumn: async (data, token) => {
    try {
      const newColumn = await columnService.createColumn(data, token);
      set((state) => ({ columns: [...state.columns, newColumn] }));
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message });
    }
  },

  updateColumn: async (id, data, token) => {
    try {
      const updatedColumn = await columnService.updateColumn(id, data, token);
      set((state) => ({
        columns: state.columns.map((c) => (c.id === id ? updatedColumn : c)),
      }));
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message });
    }
  },

  deleteColumn: async (id, token) => {
    try {
      await columnService.deleteColumn(id, token);
      set((state) => ({ columns: state.columns.filter((c) => c.id !== id) }));
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message });
    }
  },

  reorderColumns: async (activeId, overId, token) => {
    const { columns } = get();
    const originalColumns = [...columns];
    
    const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
    const overColumnIndex = columns.findIndex((col) => col.id === overId);

    if (activeColumnIndex === -1 || overColumnIndex === -1) {
      return;
    }

    const newColumns = arrayMove(columns, activeColumnIndex, overColumnIndex);
    set({ columns: newColumns });
    
    try {
      const orderedIds = newColumns.map((col) => col.id);
      await columnService.reorderColumns(orderedIds, token);
    } catch (e: unknown) {
      const error = e as Error;
      set({ error: error.message, columns: originalColumns });
    }
  },
}));