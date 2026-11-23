import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import type { CriterioItemCualitativoAsesor } from '../models/CriterioItemCualitativoAsesor';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';
import type { ItemEvaluacion } from '../models/ItemEvaluacion';
import type { ParEvaluacionCualitativaAsesor } from '../models/ParEvaluacionCualitativaAsesor';
import { mensajeErrorRegistroEvaluacionesCualitativasAsesor } from '../utils/errores-registro-evaluaciones-cualitativas-asesor';
import { registrarEvaluacionesCualitativasAsesorSchema } from '../utils/registrar-evaluaciones-cualitativas-asesor-schema';
import { useRegistrarEvaluacionesCualitativasAsesor } from './useRegistrarEvaluacionesCualitativasAsesor';

interface Opciones {
  evaluacionAsesorId: string;
  proyecto: string;
  filas: ItemEvaluacion<ItemCualitativoAsesor>[];
  criterios: CriterioItemCualitativoAsesor[];
}

export function useBorradorEvaluacionesCualitativasAsesor({
  evaluacionAsesorId,
  proyecto,
  filas,
  criterios,
}: Opciones) {
  const [borrador, setBorrador] = useState<Record<string, string>>({});
  const { mutate, isPending, reset } =
    useRegistrarEvaluacionesCualitativasAsesor(evaluacionAsesorId);

  const criteriosVigentes = new Set(criterios.map((c) => c.id));
  const pares: ParEvaluacionCualitativaAsesor[] = filas.flatMap(({ item, pendiente }) =>
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
    const validacion = registrarEvaluacionesCualitativasAsesorSchema.safeParse({
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
          mensajeErrorRegistroEvaluacionesCualitativasAsesor(err, nombresPorId),
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
