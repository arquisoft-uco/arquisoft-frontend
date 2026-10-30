import { artefactosService } from '../services/artefactosService';
import { useCatalogoArtefactosEstudiante } from './useCatalogoArtefactosEstudiante';
import { useListadoVersionesArtefacto } from './useListadoVersionesArtefacto';

export function useVersionesArtefactoEstudiante() {
  return useListadoVersionesArtefacto({
    rol: 'estudiante',
    catalogo: useCatalogoArtefactosEstudiante(),
    consultar: artefactosService.consultarVersionesArtefactoEstudiante,
  });
}
