import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, Rol } from '../../../shared/models/rol';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { usuariosService } from '../services/usuariosService';

interface RemoverRolVariables {
  usuarioId: string;
  rol: Rol;
}

interface ObjetivoRemocion extends RemoverRolVariables {
  nombre: string;
}

const REMOVER_POR_ROL: Partial<Record<Rol, (usuarioId: string) => Promise<void>>> = {
  [Rol.Coordinador]: usuariosService.removerCoordinador,
  [Rol.Estudiante]: usuariosService.removerEstudiante,
  [Rol.Asesor]: usuariosService.removerAsesor,
  [Rol.AsesorFicha]: usuariosService.removerAsesorFicha,
  [Rol.RepresentanteComiteCurriculum]: usuariosService.removerRepresentanteComite,
  [Rol.Administrador]: usuariosService.removerAdministrador,
  [Rol.Bibliotecario]: usuariosService.removerBibliotecario,
};

export function useRemoverRol() {
  const queryClient = useQueryClient();
  const [objetivo, setObjetivo] = useState<ObjetivoRemocion | null>(null);

  const mutacion = useMutation<void, unknown, RemoverRolVariables>({
    mutationFn: ({ usuarioId, rol }) => {
      const remover = REMOVER_POR_ROL[rol];
      if (!remover) return Promise.reject(new Error(`Rol no removible: ${rol}`));
      return remover(usuarioId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });

  function solicitar(nuevoObjetivo: ObjetivoRemocion) {
    setObjetivo(nuevoObjetivo);
  }

  function cancelar() {
    if (mutacion.isPending) return;
    setObjetivo(null);
  }

  function confirmar(onExito?: () => void) {
    if (!objetivo) return;
    const { usuarioId, rol, nombre } = objetivo;
    mutacion.mutate(
      { usuarioId, rol },
      {
        onSuccess: () => {
          toast.success('Rol quitado', `${nombre} ya no es ${ETIQUETAS_ROL[rol].toLowerCase()}.`);
          onExito?.();
        },
        onError: (err) => {
          toast.error('No se pudo quitar el rol', getApiErrorMessage(err, 'Inténtalo nuevamente.'));
        },
        onSettled: () => setObjetivo(null),
      },
    );
  }

  return { objetivo, solicitar, cancelar, confirmar, isPending: mutacion.isPending };
}
