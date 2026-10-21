import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export const FICHAS_ESTUDIANTE_QUERY_KEY = ['fichas-perfil', 'estudiante', 'mis-fichas'] as const;

export function useFichasPerfilEstudiante() {
  const query = useQuery({
    queryKey: FICHAS_ESTUDIANTE_QUERY_KEY,
    queryFn: fichasPerfilService.consultarFichasPerfilEstudiante,
  });

  return {
    fichas: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    error: query.error,
  };
}
