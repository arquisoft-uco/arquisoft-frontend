import { useQueries } from '@tanstack/react-query';
import type { RecursoContable } from '../models/RecursoContable';
import { dashboardService } from '../services/dashboardService';

export function useConteos(recursos: readonly RecursoContable[]) {
  const consultas = useQueries({
    queries: recursos.map((recurso) => ({
      queryKey: ['dashboard', 'conteo', recurso],
      queryFn: () => dashboardService.contar(recurso),
      staleTime: 0,
    })),
  });

  function reintentar() {
    consultas.filter((q) => q.isError).forEach((q) => void q.refetch());
  }

  const valores = consultas.map((q) => q.data);

  return {
    valores,
    total: valores.every((v) => v !== undefined) ? valores.reduce((a, b) => a + b, 0) : undefined,
    cargando: consultas.some((q) => q.isPending && !q.isError),
    hayError: consultas.some((q) => q.isError),
    reintentar,
  };
}
