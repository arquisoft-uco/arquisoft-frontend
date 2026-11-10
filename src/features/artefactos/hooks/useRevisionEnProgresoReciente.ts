import { useQuery } from '@tanstack/react-query';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';
import { desVersion } from '../utils/revision-gestionable';
import { ESTADO_REVISION_EN_PROGRESO } from '../utils/revision-resoluble';

export function useRevisionEnProgresoReciente(artefactoId: string, habilitado: boolean) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'artefactos',
      'versiones-artefacto',
      'estudiante',
      'en-progreso-reciente',
      artefactoId,
    ],
    enabled: habilitado,
    queryFn: () =>
      artefactosService
        .consultarVersionesArtefactoEstudiante({
          pagina: 0,
          tamanio: 1,
          ordenamiento: ['version:DESC'],
          filtros: construirFiltros({
            texto: '',
            desde: '',
            hasta: '',
            estadoIds: [ESTADO_REVISION_EN_PROGRESO],
            artefacto: artefactoId,
          }),
        })
        .then((pagina) => pagina.content[0] ?? null),
  });

  const revision = data ? desVersion(data) : data;

  return { revision, isLoading, isError, refetch };
}
