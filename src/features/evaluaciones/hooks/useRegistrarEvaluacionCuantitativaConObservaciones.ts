import { useState } from 'react';
import type { ObservacionPendienteEvaluacionCuantitativa } from '../models/ObservacionPendienteEvaluacionCuantitativa';
import type { ParEvaluacionCuantitativaJurado } from '../models/ParEvaluacionCuantitativaJurado';
import { useRegistrarEvaluacionesCuantitativasJurado } from './useRegistrarEvaluacionesCuantitativasJurado';
import { useRegistrarObservacionesEvaluacionCuantitativaJurado } from './useRegistrarObservacionesEvaluacionCuantitativaJurado';

export interface ResultadoRegistroConObservaciones {
  total: number;
  totalObservaciones: number;
  pendientes: ObservacionPendienteEvaluacionCuantitativa[];
}

interface OpcionesRegistrar {
  onSuccess: (resultado: ResultadoRegistroConObservaciones) => void;
  onError: (err: unknown) => void;
}

interface OpcionesReintentar {
  onSuccess: (resultado: ResultadoRegistroConObservaciones) => void;
}

export function useRegistrarEvaluacionCuantitativaConObservaciones(evaluacionJuradoId: string) {
  const puntajes = useRegistrarEvaluacionesCuantitativasJurado(evaluacionJuradoId);
  const observaciones = useRegistrarObservacionesEvaluacionCuantitativaJurado(evaluacionJuradoId);
  const [pendientes, setPendientes] = useState<ObservacionPendienteEvaluacionCuantitativa[]>([]);
  const [reintentando, setReintentando] = useState(false);

  function registrar(
    pares: ParEvaluacionCuantitativaJurado[],
    { onSuccess, onError }: OpcionesRegistrar,
  ) {
    puntajes.mutate(pares, {
      onSuccess: async () => {
        const porRegistrar = pares.flatMap(({ itemId, observacion }) =>
          observacion ? [{ itemId, descripcion: observacion }] : [],
        );
        const base = { total: pares.length, totalObservaciones: porRegistrar.length };
        if (porRegistrar.length === 0) {
          onSuccess({ ...base, pendientes: [] });
          return;
        }
        const fallidas = await observaciones.mutateAsync(porRegistrar);
        setPendientes(fallidas);
        onSuccess({ ...base, pendientes: fallidas });
      },
      onError,
    });
  }

  async function reintentar({ onSuccess }: OpcionesReintentar) {
    const porRegistrar = pendientes.map(({ itemId, descripcion }) => ({ itemId, descripcion }));
    setReintentando(true);
    try {
      const fallidas = await observaciones.mutateAsync(porRegistrar);
      setPendientes(fallidas);
      onSuccess({ total: 0, totalObservaciones: porRegistrar.length, pendientes: fallidas });
    } finally {
      setReintentando(false);
    }
  }

  return {
    registrar,
    reintentar,
    pendientes,
    enviando: puntajes.isPending || observaciones.isPending,
    reintentando,
    isError: puntajes.isError,
    error: puntajes.error,
    reiniciarError: puntajes.reset,
  };
}
