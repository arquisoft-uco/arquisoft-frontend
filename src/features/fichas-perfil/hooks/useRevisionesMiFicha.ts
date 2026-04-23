import { useQuery } from '@tanstack/react-query';
import {
  consultarRevisionesItemsMiFichaPerfil,
  consultarObservacionesItemsMiFichaPerfil,
} from '../services/fichasPerfilMockService';

export function useRevisionesMiFicha() {
  const revisionesQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'revisiones'],
    queryFn: consultarRevisionesItemsMiFichaPerfil,
  });

  const observacionesQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'observaciones-items'],
    queryFn: consultarObservacionesItemsMiFichaPerfil,
  });

  return {
    revisiones: revisionesQuery.data ?? [],
    observacionesItems: observacionesQuery.data ?? [],
    isLoading: revisionesQuery.isLoading || observacionesQuery.isLoading,
    isError: revisionesQuery.isError || observacionesQuery.isError,
  };
}
