import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginRequest, RegisterRequest } from "../types/kanban";
import * as authService from "../services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      login: async (data: LoginRequest) => {
        set({ loading: true, error: null });
        try {
          const { token } = await authService.login(data);
          set({ token, loading: false });
          // Opcional: decodificar el token para obtener el usuario
        } catch (e) {
          const error = e as Error;
          set({ error: error.message, loading: false });
        }
      },
      register: async (data: RegisterRequest) => {
        set({ loading: true, error: null });
        try {
          await authService.register(data);
          set({ loading: false });
        } catch (e) {
          const error = e as Error;
          set({ error: error.message, loading: false });
        }
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: "auth-store" }
  )
);
