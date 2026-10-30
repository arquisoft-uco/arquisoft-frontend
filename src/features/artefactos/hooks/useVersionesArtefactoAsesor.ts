import { artefactosService } from '../services/artefactosService';
import { useArtefactosAsesor } from './useArtefactosAsesor';
import { useListadoVersionesArtefacto } from './useListadoVersionesArtefacto';

export function useVersionesArtefactoAsesor() {
  return useListadoVersionesArtefacto({
    rol: 'asesor',
    catalogo: useArtefactosAsesor(),
    consultar: artefactosService.consultarVersionesArtefactoAsesor,
  });
}
