import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Rol } from '../shared/models/rol';
import { safeStorage } from './safeStorage';

const STORAGE_KEY = 'arquisoft_rol_activo';

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
