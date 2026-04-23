import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMiFichaPerfil,
  consultarCompanerosFichaPerfil,
  modificarTituloFichaPerfil,
} from '../services/fichasPerfilMockService';

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
    mutationFn: (tituloProyecto: string) => modificarTituloFichaPerfil({ tituloProyecto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', 'estudiante', 'mi-ficha'] });
    },
  });

  return {
    ficha: fichaQuery.data,
    isLoadingFicha: fichaQuery.isLoading,
    isErrorFicha: fichaQuery.isError,
    companeros: companerosQuery.data ?? [],
    modificarTitulo,
  };
}
