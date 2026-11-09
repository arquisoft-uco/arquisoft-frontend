import { useQuery } from '@tanstack/react-query';
import { coordinadoresEstudianteService } from '../services/coordinadoresEstudianteService';

export function useCoordinadoresEstudiante() {
  return useQuery({
    queryKey: ['proyectos-grado', 'estudiante', 'coordinadores'],
    queryFn: () => coordinadoresEstudianteService.consultarCoordinadores(),
  });
}
