import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { ResumenObservacionesRevision } from '../models/RevisionItem';
import { resumirObservacionesPorRevision } from '../utils/correcciones-revision';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';

const TAMANIO_MAXIMO = 100;

export function useObservacionesDeRevisionesMiFicha(revisionIds: string[]) {
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();
  const clave = [...revisionIds].sort().join(',');
  const idsOrdenados = useMemo(() => (clave ? clave.split(',') : []), [clave]);

  const query = useQuery({
    queryKey: [
      'fichas-perfil',
      'estudiante',
      fichaPerfilId,
      'revisiones',
      'observaciones',
      idsOrdenados,
    ],
    queryFn: () =>
      fichasPerfilService.consultarObservacionesItemEstudiante({
        pagina: 0,
        tamanio: TAMANIO_MAXIMO,
        filtros: {
          tipo: 'PREDICADO_MULTIVALOR',
          campo: 'revisionItem',
          operador: 'IN',
          valores: idsOrdenados,
        },
      }),
    enabled: !!fichaPerfilId && idsOrdenados.length > 0,
  });

  const pagina = query.data;
  const verificable = !query.isError && !!pagina && pagina.totalElements <= pagina.content.length;

  const resumenPorRevision = useMemo(() => {
    if (!verificable || !pagina) return new Map<string, ResumenObservacionesRevision>();
    return resumirObservacionesPorRevision(idsOrdenados, pagina.content);
  }, [verificable, pagina, idsOrdenados]);

  return { resumenPorRevision, cargando: query.isLoading, verificable };
}
