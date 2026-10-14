import { proyectosGradoService } from '../services/proyectosGradoService';
import { useListadoProyectosGrado } from './useListadoProyectosGrado';

export function useProyectosGradoAsesor() {
  return useListadoProyectosGrado({
    rol: 'asesor',
    consultar: proyectosGradoService.getProyectosAsesor,
  });
}
