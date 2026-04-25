import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMiFichaPerfil,
  consultarCompanerosFichaPerfil,
  modificarTituloFichaPerfil,
} from '../services/fichasPerfilMockService';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import { toast } from '../../../shared/hooks/useToast';

export function useMiFichaPerfil() {
  const queryClient = useQueryClient();

  const fichaQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'mi-ficha'],
    queryFn: getMiFichaPerfil,
  });

  const companerosQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'companeros'],
    queryFn: consultarCompanerosFichaPerfil,
  });

  const modificarTitulo = useMutation({
    mutationFn: (tituloProyecto: string) =>
      modificarTituloFichaPerfil({ fichaPerfilId: fichaQuery.data?.id ?? '', tituloProyecto }),
    onSuccess: (_, tituloProyecto) => {
      queryClient.setQueryData(
        ['fichas-perfil', 'estudiante', 'mi-ficha'],
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
    companeros: companerosQuery.data ?? [],
    modificarTitulo,
  };
}
