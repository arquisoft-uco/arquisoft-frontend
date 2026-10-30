import { useQuery } from '@tanstack/react-query';
import type { ArtefactoEstudiante } from '../models/ArtefactoEstudiante';
import { artefactosService } from '../services/artefactosService';

const TAMANIO_CATALOGO = 100;

export function useCatalogoArtefactosEstudiante() {
  const query = useQuery({
    queryKey: ['artefactos', 'estudiante', 'catalogo'],
    queryFn: () =>
      artefactosService.consultarArtefactosEstudiante({
        pagina: 0,
        tamanio: TAMANIO_CATALOGO,
        ordenamiento: ['nombreDocumento:ASC', 'nombreProyecto:ASC'],
      }),
  });

  const artefactos: ArtefactoEstudiante[] = query.data?.content ?? [];

  function artefactoDe(id: string): ArtefactoEstudiante | undefined {
    return artefactos.find((a) => a.id === id);
  }

  return { ...query, artefactos, artefactoDe };
}
