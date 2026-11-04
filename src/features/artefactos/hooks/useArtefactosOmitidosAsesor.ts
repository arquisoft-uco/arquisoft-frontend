import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';

export function useArtefactosOmitidosAsesor() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['artefactos', 'asesor', 'omitidos'],
    queryFn: artefactosService.getIdsArtefactosOmitidosAsesor,
    select: (ids) => new Set(ids),
  });

  return { omitidos: data, isLoading, isError };
}
