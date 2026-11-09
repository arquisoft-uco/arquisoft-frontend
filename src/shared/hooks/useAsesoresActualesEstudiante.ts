import { useQuery } from '@tanstack/react-query';
import { asesoresActualesEstudianteService } from '../services/asesoresActualesEstudianteService';

export function useAsesoresActualesEstudiante() {
  return useQuery({
    queryKey: ['proyectos-grado', 'estudiante', 'asesores-actuales'],
    queryFn: () => asesoresActualesEstudianteService.consultarAsesoresActuales(),
  });
}
