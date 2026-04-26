import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import { toast } from '../../../shared/hooks/useToast';
import { useAuthStore } from '../../../auth/authStore';

export function useMiFichaPerfil() {
  const queryClient = useQueryClient();
  const estudianteId = useAuthStore((s) => s.tokenParsed?.sub ?? '');

  const fichaQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', estudianteId, 'mi-ficha'],
    queryFn: () => fichasPerfilService.getMiFichaPerfil(estudianteId),
    enabled: !!estudianteId,
  });

  const modificarTitulo = useMutation({
    mutationFn: (tituloProyecto: string) =>
      fichasPerfilService.modificarTituloFichaPerfil({ fichaPerfilId: fichaQuery.data?.id ?? '', tituloProyecto }),
    onSuccess: (_, tituloProyecto) => {
      queryClient.setQueryData(
        ['fichas-perfil', 'estudiante', estudianteId, 'mi-ficha'],
        (prev: MiFichaPerfilResponse) => ({ ...prev, tituloProyecto }),
      );
      toast.success('Ficha actualizada', 'El título del proyecto se guardó correctamente.');
    },
    onError: () => toast.error('Error al modificar', 'No se pudo actualizar el título de la ficha.'),
  });

  return {
    ficha: fichaQuery.data,
    isLoadingFicha: fichaQuery.isLoading,
    isErrorFicha: fichaQuery.isError,
    companeros: fichaQuery.data?.integrantes ?? [],
    modificarTitulo,
  };
}
