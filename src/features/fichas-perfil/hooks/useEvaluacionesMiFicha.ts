import { useQuery } from '@tanstack/react-query';
import type { EvaluacionFichaPerfilEstudiante } from '../models/EvaluacionFichaPerfilEstudiante';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';

function masRecientePrimero(evaluaciones: EvaluacionFichaPerfilEstudiante[]) {
  return [...evaluaciones].reverse();
}

export function useEvaluacionesMiFicha() {
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();

  const { data, isLoading, isError, isSuccess, error, refetch } = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', fichaPerfilId, 'evaluaciones'],
    queryFn: () => fichasPerfilService.consultarEvaluacionesMiFichaPerfil(fichaPerfilId ?? ''),
    enabled: !!fichaPerfilId,
    select: masRecientePrimero,
  });

  return {
    evaluaciones: data ?? [],
    isLoading,
    cargado: isSuccess,
    isError,
    error,
    refetch,
    fichaPerfilIdDisponible: !!fichaPerfilId,
  };
}
