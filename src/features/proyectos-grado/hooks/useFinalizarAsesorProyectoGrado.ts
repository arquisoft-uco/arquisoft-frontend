import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectosGradoService } from '../services/proyectosGradoService';
import { ESTADO_ASESOR_FINALIZADO } from '../utils/cupo-asesor';

export function useFinalizarAsesorProyectoGrado(proyectoGradoId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string>({
    mutationFn: (asesorId) =>
      proyectosGradoService.cambiarEstadoAsesor({
        proyectoGradoId,
        asesorId,
        estadoAsesorId: ESTADO_ASESOR_FINALIZADO,
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos-grado', proyectoGradoId, 'asesores'] });
    },
  });
}
