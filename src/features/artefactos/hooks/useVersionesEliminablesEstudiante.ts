import { useQueries } from '@tanstack/react-query';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { construirFiltros } from '../utils/filtros-versiones-artefacto';
import { tieneRevision } from '../utils/revision-version';
import { esVersionEliminable } from '../utils/version-eliminable';

export function useVersionesEliminablesEstudiante(versiones: VersionArtefacto[]) {
  const artefactoIds = [
    ...new Set(versiones.filter((v) => !tieneRevision(v)).map((v) => v.artefacto)),
  ];

  const consultas = useQueries({
    queries: artefactoIds.map((artefactoId) => ({
      queryKey: ['artefactos', 'versiones-artefacto', 'estudiante', 'ultimas-dos', artefactoId],
      queryFn: () =>
        artefactosService
          .consultarVersionesArtefactoEstudiante({
            pagina: 0,
            tamanio: 2,
            ordenamiento: ['version:DESC'],
            filtros: construirFiltros({
              texto: '',
              desde: '',
              hasta: '',
              estadoIds: [],
              artefacto: artefactoId,
            }),
          })
          .then((pagina) => pagina.content),
    })),
  });

  const porArtefacto = new Map(artefactoIds.map((id, i) => [id, consultas[i].data]));

  return {
    puedeEliminar: (version: VersionArtefacto): boolean => {
      const ultimas = porArtefacto.get(version.artefacto);
      return ultimas ? esVersionEliminable(version, ultimas) : false;
    },
  };
}
