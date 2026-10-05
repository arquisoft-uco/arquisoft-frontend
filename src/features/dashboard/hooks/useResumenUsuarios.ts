import { useQueries } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useResumenUsuarios() {
  const [vigentes, bajas] = useQueries({
    queries: [true, false].map((vigente) => ({
      queryKey: ['dashboard', 'administrador', 'usuarios', vigente ? 'vigentes' : 'bajas'],
      queryFn: () => dashboardService.contarUsuarios({ vigente }),
      staleTime: 0,
    })),
  });

  function reintentar() {
    [vigentes, bajas].filter((q) => q.isError).forEach((q) => void q.refetch());
  }

  return {
    vigentes: vigentes.data,
    bajas: bajas.data,
    cargando: vigentes.isPending || bajas.isPending,
    hayError: vigentes.isError || bajas.isError,
    reintentar,
  };
}
