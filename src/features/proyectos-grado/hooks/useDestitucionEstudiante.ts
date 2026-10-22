import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import type { EstudianteProyectoGrado } from '../models/EstudianteProyectoGrado';
import { mensajeErrorDestitucion } from '../utils/errores-destitucion';
import { useDestituirEstudianteProyectoGrado } from './useDestituirEstudianteProyectoGrado';

export function useDestitucionEstudiante(proyectoGradoId: string) {
  const { mutate, isPending: destituyendo } = useDestituirEstudianteProyectoGrado(proyectoGradoId);
  const [pendiente, setPendiente] = useState<EstudianteProyectoGrado | null>(null);

  function confirmar() {
    if (!pendiente) return;
    const { estudianteId, nombre } = pendiente;
    mutate(estudianteId, {
      onSuccess: () => {
        toast.success(
          'Estudiante destituido',
          `${nombre} ya no está vinculado al proyecto de grado.`,
        );
      },
      onError: (err) => {
        toast.error('No se pudo destituir al estudiante', mensajeErrorDestitucion(err));
      },
      onSettled: () => setPendiente(null),
    });
  }

  return {
    pendiente,
    destituyendo,
    solicitar: setPendiente,
    confirmar,
    cancelar: () => setPendiente(null),
  };
}
