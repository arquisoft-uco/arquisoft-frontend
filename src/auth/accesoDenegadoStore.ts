import { create } from 'zustand';
import { useAuthStore } from './authStore';

interface AccesoDenegadoState {
  ruta: string | null;
  marcar: (rutaOrigen: string | undefined) => void;
  limpiar: () => void;
}

// Solo memoria, sin persist. Lo escribe el interceptor de Axios (fuera de React) y lo lee useAccesoDenegado.
export const useAccesoDenegadoStore = create<AccesoDenegadoState>()((set) => ({
  ruta: null,
  marcar: (rutaOrigen) => {
    if (rutaOrigen === undefined) return;
    const { authenticated, isInitializing } = useAuthStore.getState();
    if (!authenticated || isInitializing) return;
    // Una petición que nació en otra ruta quedó huérfana: no bloquea la sección actual
    if (rutaOrigen !== window.location.pathname) return;
    set({ ruta: rutaOrigen });
  },
  limpiar: () => set({ ruta: null }),
}));
