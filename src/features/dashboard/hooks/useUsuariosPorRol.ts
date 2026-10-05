import { useQueries } from '@tanstack/react-query';
import { ROLES_CONTABLES, dashboardService } from '../services/dashboardService';

export function useUsuariosPorRol() {
  const consultas = useQueries({
    queries: ROLES_CONTABLES.map((rol) => ({
      queryKey: ['dashboard', 'administrador', 'usuarios-por-rol', rol],
      queryFn: () => dashboardService.contarUsuarios({ vigente: true, rol }),
      staleTime: 0,
    })),
  });

  function reintentar() {
    consultas.filter((q) => q.isError).forEach((q) => void q.refetch());
  }

  return {
    filas: ROLES_CONTABLES.map((rol, i) => ({ rol, total: consultas[i].data })),
    cargando: consultas.some((q) => q.isPending),
    hayError: consultas.some((q) => q.isError),
    reintentar,
  };
}
