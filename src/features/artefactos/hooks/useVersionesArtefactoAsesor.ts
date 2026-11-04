import { artefactosService } from '../services/artefactosService';
import { useListadoVersionesArtefacto } from './useListadoVersionesArtefacto';

export function useVersionesArtefactoAsesor() {
  return useListadoVersionesArtefacto({
    rol: 'asesor',
    consultar: artefactosService.consultarVersionesArtefactoAsesor,
  });
}
