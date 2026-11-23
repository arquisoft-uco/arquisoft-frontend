import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import type { CriterioItemCualitativoJurado } from '../models/CriterioItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';
import type { ItemEvaluacion } from '../models/ItemEvaluacion';
import type { ParEvaluacionCualitativaJurado } from '../models/ParEvaluacionCualitativaJurado';
import { mensajeErrorRegistroEvaluacionesCualitativas } from '../utils/errores-registro-evaluaciones-cualitativas';
import { registrarEvaluacionesCualitativasJuradoSchema } from '../utils/registrar-evaluaciones-cualitativas-jurado-schema';
import { useRegistrarEvaluacionesCualitativasJurado } from './useRegistrarEvaluacionesCualitativasJurado';

interface Opciones {
  evaluacionJuradoId: string;
  proyecto: string;
  filas: ItemEvaluacion<ItemCualitativoJurado>[];
  criterios: CriterioItemCualitativoJurado[];
}

export function useBorradorEvaluacionesCualitativasJurado({
  evaluacionJuradoId,
  proyecto,
  filas,
  criterios,
}: Opciones) {
  const [borrador, setBorrador] = useState<Record<string, string>>({});
  const { mutate, isPending, reset } =
    useRegistrarEvaluacionesCualitativasJurado(evaluacionJuradoId);

  const criteriosVigentes = new Set(criterios.map((c) => c.id));
  const pares: ParEvaluacionCualitativaJurado[] = filas.flatMap(({ item, pendiente }) =>
    pendiente && criteriosVigentes.has(borrador[item.id])
      ? [{ itemId: item.id, criterioId: borrador[item.id] }]
      : [],
  );

  function elegir(itemId: string, criterioId: string) {
    reset();
    setBorrador((actual) => {
      if (criterioId) return { ...actual, [itemId]: criterioId };
      const { [itemId]: _quitado, ...resto } = actual;
      return resto;
    });
  }

  function descartar() {
    reset();
    setBorrador({});
  }

  function registrar() {
    const nombresPorId = new Map(filas.map(({ item }) => [item.id, item.nombre]));
    const validacion = registrarEvaluacionesCualitativasJuradoSchema.safeParse({
      evaluaciones: pares,
    });
    if (!validacion.success) {
      toast.error('No se pudo registrar la evaluación', validacion.error.issues[0]?.message);
      return;
    }
    mutate(validacion.data.evaluaciones, {
      onSuccess: () => {
        const total = pares.length;
        toast.success(
          'Evaluación registrada',
          `Se registraron ${total} ${total === 1 ? 'valoración' : 'valoraciones'} de ${proyecto}.`,
        );
        setBorrador({});
      },
      onError: (err) => {
        toast.error(
          'No se pudo registrar la evaluación',
          mensajeErrorRegistroEvaluacionesCualitativas(err, nombresPorId),
        );
      },
    });
  }

  return {
    borrador,
    cantidad: pares.length,
    elegir,
    registrar,
    descartar,
    enviando: isPending,
  };
}
