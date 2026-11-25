import { evaluacionDescartada, evaluacionVigente } from '../utils/evaluacion-asistente';
import { useEvaluacionFicha } from './useEvaluacionFicha';

export function useEvaluacionDescartada(fichaPerfilId: string) {
  const { data, isPending } = useEvaluacionFicha(fichaPerfilId);
  const vigente = data ? evaluacionVigente(data) : undefined;

  return {
    descartada: vigente ? evaluacionDescartada(vigente) : false,
    cargando: isPending,
  };
}
