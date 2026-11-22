import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { enteroEntre, LIMITES, textoRequerido } from '../../../shared/validation';
import type { ItemCuantitativoJurado } from '../models/ItemCuantitativoJurado';
import type { ItemEvaluacionJurado } from '../models/ItemEvaluacionJurado';
import type { ParEvaluacionCuantitativaJurado } from '../models/ParEvaluacionCuantitativaJurado';
import {
  mensajeErrorRegistroEvaluacionesCuantitativas,
  mensajeExitoRegistroEvaluacionesCuantitativas,
  mensajeObservacionesFaltantes,
} from '../utils/errores-registro-evaluaciones-cuantitativas';
import { registrarEvaluacionesCuantitativasJuradoSchema } from '../utils/registrar-evaluaciones-cuantitativas-jurado-schema';
import {
  useRegistrarEvaluacionCuantitativaConObservaciones,
  type ResultadoRegistroConObservaciones,
} from './useRegistrarEvaluacionCuantitativaConObservaciones';

export interface ValoracionBorrador {
  puntaje: string;
  observacion: string;
}

export interface ErroresValoracionBorrador {
  puntaje?: string;
  observacion?: string;
}

type CampoBorrador = keyof ValoracionBorrador;

interface Opciones {
  evaluacionJuradoId: string;
  proyecto: string;
  filas: ItemEvaluacionJurado<ItemCuantitativoJurado>[];
}

const VACIA: ValoracionBorrador = { puntaje: '', observacion: '' };

function estaElegida({ puntaje, observacion }: ValoracionBorrador): boolean {
  return puntaje.trim() !== '' || observacion.trim() !== '';
}

function validarValoracion(
  item: ItemCuantitativoJurado,
  { puntaje, observacion }: ValoracionBorrador,
): ErroresValoracionBorrador {
  const errores: ErroresValoracionBorrador = {};
  const delPuntaje = enteroEntre(LIMITES.ITEM_CUANTITATIVO_VALOR_MIN, item.valor).safeParse(
    puntaje,
  );
  if (!delPuntaje.success) errores.puntaje = delPuntaje.error.issues[0]?.message;
  if (observacion.trim() !== '') {
    const deLaObservacion = textoRequerido(
      LIMITES.OBSERVACION_ITEM_JURADO_DESCRIPCION_MAX,
    ).safeParse(observacion);
    if (!deLaObservacion.success) errores.observacion = deLaObservacion.error.issues[0]?.message;
  }
  return errores;
}

export function useBorradorEvaluacionesCuantitativasJurado({
  evaluacionJuradoId,
  proyecto,
  filas,
}: Opciones) {
  const [borrador, setBorrador] = useState<Record<string, ValoracionBorrador>>({});
  const [errores, setErrores] = useState<Record<string, ErroresValoracionBorrador>>({});
  const registro = useRegistrarEvaluacionCuantitativaConObservaciones(evaluacionJuradoId);

  const elegidas = filas.filter(
    ({ item, pendiente }) => pendiente && estaElegida(borrador[item.id] ?? VACIA),
  );
  const nombresPorId = new Map(filas.map(({ item }) => [item.id, item.nombre]));

  function limpiarBorrador() {
    setBorrador({});
    setErrores({});
  }

  function cambiar(itemId: string, campo: CampoBorrador, valor: string) {
    registro.reiniciarError();
    setBorrador((actual) => ({
      ...actual,
      [itemId]: { ...(actual[itemId] ?? VACIA), [campo]: valor },
    }));
    setErrores((actual) => {
      if (!actual[itemId]?.[campo]) return actual;
      return { ...actual, [itemId]: { ...actual[itemId], [campo]: undefined } };
    });
  }

  function validarFila(itemId: string) {
    const fila = filas.find(({ item }) => item.id === itemId);
    const valoracion = borrador[itemId];
    if (!fila || !valoracion || !estaElegida(valoracion)) return;
    setErrores((actual) => ({ ...actual, [itemId]: validarValoracion(fila.item, valoracion) }));
  }

  function terminar({
    total,
    totalObservaciones,
    pendientes: faltan,
  }: ResultadoRegistroConObservaciones) {
    if (faltan.length > 0) {
      toast.error('Faltan observaciones', mensajeObservacionesFaltantes(faltan.length));
    } else {
      toast.success(
        'Evaluación registrada',
        mensajeExitoRegistroEvaluacionesCuantitativas(total, totalObservaciones, proyecto),
      );
    }
    if (total > 0) limpiarBorrador();
  }

  function registrar(): string | null {
    const nuevosErrores: Record<string, ErroresValoracionBorrador> = {};
    for (const { item } of elegidas) {
      const delItem = validarValoracion(item, borrador[item.id] ?? VACIA);
      if (delItem.puntaje || delItem.observacion) nuevosErrores[item.id] = delItem;
    }
    setErrores(nuevosErrores);
    const primeraInvalida = elegidas.find(({ item }) => nuevosErrores[item.id]);
    if (primeraInvalida) return primeraInvalida.item.id;

    const pares: ParEvaluacionCuantitativaJurado[] = elegidas.map(({ item }) => {
      const { puntaje, observacion } = borrador[item.id] ?? VACIA;
      const texto = observacion.trim();
      return {
        itemId: item.id,
        puntaje: Number(puntaje.trim()),
        ...(texto ? { observacion: texto } : {}),
      };
    });
    const validacion = registrarEvaluacionesCuantitativasJuradoSchema.safeParse({
      evaluaciones: pares,
    });
    if (!validacion.success) {
      toast.error('No se pudo registrar la evaluación', validacion.error.issues[0]?.message);
      return null;
    }
    registro.registrar(validacion.data.evaluaciones, {
      onSuccess: terminar,
      onError: (err) => {
        toast.error(
          'No se pudo registrar la evaluación',
          mensajeErrorRegistroEvaluacionesCuantitativas(err, nombresPorId),
        );
      },
    });
    return null;
  }

  function descartar() {
    registro.reiniciarError();
    limpiarBorrador();
  }

  return {
    borrador,
    errores,
    cantidad: elegidas.length,
    cambiar,
    validarFila,
    registrar,
    descartar,
    enviando: registro.enviando,
    pendientes: registro.pendientes,
    reintentando: registro.reintentando,
    reintentar: () => registro.reintentar({ onSuccess: terminar }),
    descartarPendientes: registro.descartarPendientes,
  };
}
