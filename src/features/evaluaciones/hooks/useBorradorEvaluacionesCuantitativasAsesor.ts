import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { enteroEntre, LIMITES } from '../../../shared/validation';
import type { ItemCuantitativoAsesor } from '../models/ItemCuantitativoAsesor';
import type { ItemEvaluacion } from '../models/ItemEvaluacion';
import type { ParEvaluacionCuantitativaAsesor } from '../models/ParEvaluacionCuantitativaAsesor';
import { mensajeErrorRegistroEvaluacionesCuantitativasAsesor } from '../utils/errores-registro-evaluaciones-cuantitativas-asesor';
import { mensajeExitoRegistroEvaluacionesCuantitativas } from '../utils/errores-registro-evaluaciones-cuantitativas';
import { registrarEvaluacionesCuantitativasAsesorSchema } from '../utils/registrar-evaluaciones-cuantitativas-asesor-schema';
import { useRegistrarEvaluacionesCuantitativasAsesor } from './useRegistrarEvaluacionesCuantitativasAsesor';

interface Opciones {
  evaluacionAsesorId: string;
  proyecto: string;
  filas: ItemEvaluacion<ItemCuantitativoAsesor>[];
}

function mensajePuntaje(item: ItemCuantitativoAsesor, puntaje: string): string | undefined {
  const resultado = enteroEntre(LIMITES.ITEM_CUANTITATIVO_VALOR_MIN, item.valor).safeParse(puntaje);
  return resultado.success ? undefined : resultado.error.issues[0]?.message;
}

export function useBorradorEvaluacionesCuantitativasAsesor({
  evaluacionAsesorId,
  proyecto,
  filas,
}: Opciones) {
  const [borrador, setBorrador] = useState<Record<string, string>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const { mutate, isPending, reset } =
    useRegistrarEvaluacionesCuantitativasAsesor(evaluacionAsesorId);

  const elegidas = filas.filter(
    ({ item, pendiente }) => pendiente && (borrador[item.id] ?? '').trim() !== '',
  );

  function limpiar() {
    setBorrador({});
    setErrores({});
  }

  function cambiar(itemId: string, puntaje: string) {
    reset();
    setBorrador((actual) => ({ ...actual, [itemId]: puntaje }));
    setErrores((actual) => {
      if (!actual[itemId]) return actual;
      const { [itemId]: _quitado, ...resto } = actual;
      return resto;
    });
  }

  function validarFila(itemId: string) {
    const fila = filas.find(({ item }) => item.id === itemId);
    const puntaje = borrador[itemId] ?? '';
    if (!fila || puntaje.trim() === '') return;
    const mensaje = mensajePuntaje(fila.item, puntaje);
    setErrores((actual) => {
      if (mensaje) return { ...actual, [itemId]: mensaje };
      const { [itemId]: _quitado, ...resto } = actual;
      return resto;
    });
  }

  function registrar(): string | null {
    const nuevosErrores: Record<string, string> = {};
    for (const { item } of elegidas) {
      const mensaje = mensajePuntaje(item, borrador[item.id] ?? '');
      if (mensaje) nuevosErrores[item.id] = mensaje;
    }
    setErrores(nuevosErrores);
    const primeraInvalida = elegidas.find(({ item }) => nuevosErrores[item.id]);
    if (primeraInvalida) return primeraInvalida.item.id;

    const pares: ParEvaluacionCuantitativaAsesor[] = elegidas.map(({ item }) => ({
      itemId: item.id,
      puntaje: Number((borrador[item.id] ?? '').trim()),
    }));
    const validacion = registrarEvaluacionesCuantitativasAsesorSchema.safeParse({
      evaluaciones: pares,
    });
    if (!validacion.success) {
      toast.error('No se pudo registrar la evaluación', validacion.error.issues[0]?.message);
      return null;
    }
    const nombresPorId = new Map(filas.map(({ item }) => [item.id, item.nombre]));
    mutate(validacion.data.evaluaciones, {
      onSuccess: () => {
        toast.success(
          'Evaluación registrada',
          mensajeExitoRegistroEvaluacionesCuantitativas(pares.length, 0, proyecto),
        );
        limpiar();
      },
      onError: (err) => {
        toast.error(
          'No se pudo registrar la evaluación',
          mensajeErrorRegistroEvaluacionesCuantitativasAsesor(err, nombresPorId),
        );
      },
    });
    return null;
  }

  function descartar() {
    reset();
    limpiar();
  }

  return {
    borrador,
    errores,
    cantidad: elegidas.length,
    cambiar,
    validarFila,
    registrar,
    descartar,
    enviando: isPending,
  };
}
