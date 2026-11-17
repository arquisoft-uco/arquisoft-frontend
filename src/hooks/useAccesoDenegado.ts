import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useAccesoDenegadoStore } from '../auth/accesoDenegadoStore';
import { useRolActivo } from './useAuth';

export function useAccesoDenegado(): { denegado: boolean; reintentar: () => void } {
  const ruta = useAccesoDenegadoStore((s) => s.ruta);
  const limpiar = useAccesoDenegadoStore((s) => s.limpiar);
  const location = useLocation();
  const rolActivo = useRolActivo();

  // Sincroniza un store externo (lo escribe el interceptor) con la navegación y el rol
  useEffect(() => {
    limpiar();
  }, [location.key, rolActivo, limpiar]);

  return { denegado: ruta !== null && ruta === location.pathname, reintentar: limpiar };
}
