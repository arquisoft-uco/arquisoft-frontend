import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import type { AsesorProyectoGrado } from '../models/AsesorProyectoGrado';
import { mensajeErrorFinalizacionAsesor } from '../utils/errores-finalizacion-asesor';
import { useFinalizarAsesorProyectoGrado } from './useFinalizarAsesorProyectoGrado';

export function useFinalizacionAsesor(proyectoGradoId: string) {
  const { mutate, isPending: finalizando } = useFinalizarAsesorProyectoGrado(proyectoGradoId);
  const [pendiente, setPendiente] = useState<AsesorProyectoGrado | null>(null);

  function confirmar() {
    if (!pendiente) return;
    const { asesorId, nombre } = pendiente;
    mutate(asesorId, {
      onSuccess: () => {
        toast.success(
          'Participación finalizada',
          `${nombre} ya no es asesor de este proyecto de grado.`,
        );
      },
      onError: (err) => {
        toast.error('No se pudo finalizar la participación', mensajeErrorFinalizacionAsesor(err));
      },
      onSettled: () => setPendiente(null),
    });
  }

  return {
    pendiente,
    finalizando,
    solicitar: setPendiente,
    confirmar,
    cancelar: () => setPendiente(null),
  };
}
