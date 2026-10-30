import { useQuery } from '@tanstack/react-query';
import type { OpcionCombobox } from '../../../shared/hooks/useCombobox';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import { nombreArtefacto } from '../utils/nombre-artefacto';
import { artefactosService } from '../services/artefactosService';

const TAMANIO_CATALOGO = 100;

export function useArtefactosAsesor() {
  const query = useQuery({
    queryKey: ['artefactos', 'asesor', 'catalogo'],
    queryFn: () =>
      artefactosService.consultarArtefactosAsesor({
        pagina: 0,
        tamanio: TAMANIO_CATALOGO,
        ordenamiento: ['nombreDocumento:ASC', 'nombreProyecto:ASC'],
      }),
  });

  const artefactos: ArtefactoAsesor[] = query.data?.content ?? [];
  const opciones: OpcionCombobox[] = artefactos.map((artefacto) => ({
    id: artefacto.id,
    etiqueta: artefacto.nombreDocumento,
    descripcion: artefacto.nombreProyecto,
  }));

  function artefactoDe(id: string): ArtefactoAsesor | undefined {
    return artefactos.find((a) => a.id === id);
  }

  function nombreDe(id: string): string | undefined {
    const artefacto = artefactoDe(id);
    return artefacto && nombreArtefacto(artefacto);
  }

  return { ...query, artefactos, opciones, artefactoDe, nombreDe };
}
