import { artefactosService } from '../services/artefactosService';
import { useListadoVersionesArtefacto } from './useListadoVersionesArtefacto';

export function useVersionesArtefactoEstudiante() {
  return useListadoVersionesArtefacto({
    rol: 'estudiante',
    consultar: artefactosService.consultarVersionesArtefactoEstudiante,
  });
}
