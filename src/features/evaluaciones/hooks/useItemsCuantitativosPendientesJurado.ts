import { useMemo } from 'react';
import { marcarItemsPendientes, soloPendientes } from '../utils/items-pendientes-jurado';
import { useEvaluacionesCuantitativasRealizadasJurado } from './useEvaluacionesCuantitativasRealizadasJurado';
import { useItemsCuantitativosJurado } from './useItemsCuantitativosJurado';

export function useItemsCuantitativosPendientesJurado(evaluacionJuradoId: string) {
  const catalogo = useItemsCuantitativosJurado();
  const realizadas = useEvaluacionesCuantitativasRealizadasJurado(evaluacionJuradoId);

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
