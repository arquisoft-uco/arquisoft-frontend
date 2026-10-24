import { proyectosGradoService } from '../services/proyectosGradoService';
import { useListadoProyectosGrado } from './useListadoProyectosGrado';

export function useProyectosGradoCoordinador() {
  return useListadoProyectosGrado({
    rol: 'coordinador',
    consultar: proyectosGradoService.getProyectosCoordinador,
  });
}
