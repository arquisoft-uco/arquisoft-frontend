import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ProveedorId } from './proveedores/proveedor';
import { safeStorage } from './safeStorage';

interface ProveedorState {
  proveedor: ProveedorId | null;
  confirmadoEnEstaCarga: boolean;
  elegirProveedor: (id: ProveedorId) => void;
  limpiarProveedor: () => void;
}

export const useProveedorStore = create<ProveedorState>()(
  persist(
    (set) => ({
      proveedor: null,
      confirmadoEnEstaCarga: false,
      elegirProveedor: (id) => set({ proveedor: id, confirmadoEnEstaCarga: true }),
      limpiarProveedor: () => set({ proveedor: null, confirmadoEnEstaCarga: false }),
    }),
    {
      name: 'arquisoft_proveedor_identidad',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ proveedor: state.proveedor }),
    },
  ),
);
