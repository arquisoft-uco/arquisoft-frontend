import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useEstudiantesProyectoCatalogo(proyectoGradoId: string) {
  const query = useQuery({
    queryKey: ['artefactos', 'catalogos', 'estudiantes-proyecto', proyectoGradoId],
    queryFn: () => artefactosService.getEstudiantesProyectoAsesorado(proyectoGradoId),
    enabled: !!proyectoGradoId,
  });

  return {
    estudiantes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
