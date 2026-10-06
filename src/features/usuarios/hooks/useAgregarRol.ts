import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../../../shared/hooks/useToast';
import { ETIQUETAS_ROL, type Rol } from '../../../shared/models/rol';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { usuariosService } from '../services/usuariosService';

interface AgregarRolVariables {
  usuarioId: string;
  rol: Rol;
  nombre: string;
}

// Los avisos viven en la mutación y no en el mutate del componente: si el panel se cierra con el rol en vuelo,
// los callbacks de mutate no se ejecutan y la persona se quedaría sin saber si el rol se agregó.
export function useAgregarRol() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, AgregarRolVariables>({
    mutationFn: ({ usuarioId, rol }) => usuariosService.agregarRol(usuarioId, rol),
    onSuccess: (_datos, { rol, nombre }) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Rol agregado', `Se agregó el rol ${ETIQUETAS_ROL[rol]} a ${nombre}.`);
    },
    onError: (err) => {
      toast.error('No se pudo agregar el rol', getApiErrorMessage(err, 'Inténtalo nuevamente.'));
    },
  });
}
