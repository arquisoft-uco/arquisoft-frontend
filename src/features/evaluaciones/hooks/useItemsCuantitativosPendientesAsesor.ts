import { useMemo } from 'react';
import { marcarItemsPendientes, soloPendientes } from '../utils/items-pendientes';
import { useEvaluacionesCuantitativasAsesor } from './useEvaluacionesCuantitativasAsesor';
import { useItemsCuantitativosAsesor } from './useItemsCuantitativosAsesor';

export function useItemsCuantitativosPendientesAsesor(evaluacionAsesorId: string) {
  const catalogo = useItemsCuantitativosAsesor();
  const realizadas = useEvaluacionesCuantitativasAsesor(evaluacionAsesorId);

  const filas = useMemo(
    () =>
      catalogo.data && realizadas.data ? marcarItemsPendientes(catalogo.data, realizadas.data) : [],
    [catalogo.data, realizadas.data],
  );
  const pendientes = useMemo(() => soloPendientes(filas), [filas]);
  const fallida = catalogo.isError ? catalogo : realizadas.isError ? realizadas : null;

  return {
    filas,
    pendientes,
    isLoading: catalogo.isLoading || realizadas.isLoading,
    isError: fallida !== null,
    error: fallida?.error ?? null,
    refetch: () => void (fallida ?? catalogo).refetch(),
  };
}
