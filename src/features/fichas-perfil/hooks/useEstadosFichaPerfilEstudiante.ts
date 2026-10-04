import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';

export function useEstadosFichaPerfilEstudiante() {
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', fichaPerfilId, 'estados-ficha'],
    queryFn: () => fichasPerfilService.getEstadosFichaPerfilEstudiante(fichaPerfilId ?? ''),
    enabled: !!fichaPerfilId,
  });

  return {
    historial: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    fichaPerfilIdDisponible: !!fichaPerfilId,
  };
}
