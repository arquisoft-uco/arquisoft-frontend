import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { CambiarAsesorRequest } from '../models/CambiarAsesorRequest';
import type { Asesor } from '../models/Asesor';
import type { FichaPerfil } from '../models/FichaPerfil';
import type { Page } from '../../../shared/models/api-response';

interface CambiarAsesorVariables extends CambiarAsesorRequest {
  asesorNuevo: Asesor;
}

export function useCambiarAsesor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idFicha, idAsesorFicha }: CambiarAsesorVariables) =>
      fichasPerfilService.cambiarAsesor({ idFicha, idAsesorFicha }),
    onSuccess: (_, { idFicha, asesorNuevo }) => {
      queryClient.setQueriesData<Page<FichaPerfil>>(
        { queryKey: ['fichas-perfil', 'coordinador'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            content: old.content.map((f) =>
              f.id === idFicha ? { ...f, asesor: asesorNuevo } : f,
            ),
          };
        },
      );
    },
  });
}
