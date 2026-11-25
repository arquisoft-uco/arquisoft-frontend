import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { useFiltrosArtefactosEstudiante } from './useFiltrosArtefactosEstudiante';

export function useArtefactosEstudiante() {
  const { claveFiltros, criterio, habilitado, ...filtrosUrl } = useFiltrosArtefactosEstudiante();

  const query = useQuery({
    queryKey: ['artefactos', 'estudiante', 'mis-artefactos', ...claveFiltros],
    queryFn: () => artefactosService.consultarArtefactosEstudiante(criterio),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });

  return { ...query, ...filtrosUrl };
}
