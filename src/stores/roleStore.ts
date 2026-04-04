import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Rol } from '../shared/models/rol';

const STORAGE_KEY = 'arquisoft_rol_activo';

/**
 * Safe localStorage adapter — matches the try/catch pattern from Angular's
 * RolActivoService._persistirRol(). Handles Safari private-browsing and
 * storage-full errors without throwing.
 */
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors silently
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage errors silently
    }
  },
};

interface RoleState {
  /** The role explicitly chosen by the user (may be null if not chosen yet). */
  rolSeleccionado: Rol | null;
  setRolSeleccionado: (rol: Rol) => void;
  clearRolSeleccionado: () => void;
}

/**
 * Role store — persists ONLY the selected role string, never the JWT.
 * Validation at read time (via useRolActivo hook) ensures the stored value
 * is still in the user's JWT roles.
 */
export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      rolSeleccionado: null,
      setRolSeleccionado: (rol) => set({ rolSeleccionado: rol }),
      clearRolSeleccionado: () => set({ rolSeleccionado: null }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
    },
  ),
);
