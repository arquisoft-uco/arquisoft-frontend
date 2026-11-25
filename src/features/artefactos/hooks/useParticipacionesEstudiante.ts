import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { agruparPorProyecto } from '../utils/agrupar-participaciones';
import { ordenamientoParticipaciones } from '../utils/orden-participaciones';
import { useFiltrosArtefactosEstudiante } from './useFiltrosArtefactosEstudiante';

export function useParticipacionesEstudiante() {
  const { claveFiltros, criterio, habilitado, ...filtrosUrl } = useFiltrosArtefactosEstudiante(
    ordenamientoParticipaciones,
  );

  const query = useQuery({
    queryKey: ['artefactos', 'estudiante', 'participaciones', ...claveFiltros],
    queryFn: () => artefactosService.consultarParticipacionesEstudiante(criterio),
    enabled: habilitado,
    placeholderData: keepPreviousData,
  });

  const proyectos = agruparPorProyecto(query.data?.content ?? []);

  return { ...query, ...filtrosUrl, proyectos };
}
