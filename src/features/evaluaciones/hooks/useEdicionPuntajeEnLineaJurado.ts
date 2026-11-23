import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../shared/utils/api-error';
import type { EdicionPuntajeEnLinea } from '../models/EdicionPuntajeEnLinea';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import { cambiarPuntajeEvaluacionCuantitativaJuradoSchema } from '../utils/cambiar-puntaje-evaluacion-cuantitativa-jurado-schema';
import {
  cierraPanelCambiarPuntajeEvaluacionCuantitativaJurado,
  mensajeErrorCambiarPuntajeEvaluacionCuantitativaJurado,
} from '../utils/errores-cambiar-puntaje-evaluacion-cuantitativa-jurado';
import { useCambiarPuntajeEvaluacionCuantitativaJurado } from './useCambiarPuntajeEvaluacionCuantitativaJurado';

export function useEdicionPuntajeEnLineaJurado(evaluacionJuradoId: string) {
  const [edicion, setEdicion] = useState<EdicionPuntajeEnLinea | null>(null);
  const { mutate, isPending, reset } =
    useCambiarPuntajeEvaluacionCuantitativaJurado(evaluacionJuradoId);

  function iniciar(fila: EvaluacionCuantitativaJurado) {
    reset();
    setEdicion({
      filaId: fila.id,
      valor: String(fila.puntaje),
      valorInicial: String(fila.puntaje),
      nombreItem: fila.item.nombre,
      valorMaximo: fila.item.valor,
    });
  }

  function cambiar(valor: string) {
    setEdicion((actual) => (actual ? { ...actual, valor, error: undefined } : actual));
  }

  function cancelar() {
    reset();
    setEdicion(null);
  }

  function guardar() {
    if (!edicion) return;
    const { filaId, valor, valorInicial, nombreItem, valorMaximo } = edicion;
    if (valor.trim() === valorInicial) {
      cancelar();
      return;
    }
    const validacion = cambiarPuntajeEvaluacionCuantitativaJuradoSchema(valorMaximo).safeParse({
      puntaje: valor,
    });
    if (!validacion.success) {
      setEdicion({ ...edicion, error: validacion.error.issues[0]?.message });
      return;
    }
    mutate(
      { evaluacionCuantitativaJuradoId: filaId, puntaje: Number(validacion.data.puntaje.trim()) },
      {
        onSuccess: () => {
          toast.success('Puntaje cambiado', `El puntaje de "${nombreItem}" fue actualizado.`);
          setEdicion(null);
        },
        onError: (err) => {
          const mensaje = mensajeErrorCambiarPuntajeEvaluacionCuantitativaJurado(err);
          toast.error('No se pudo cambiar el puntaje', mensaje);
          if (cierraPanelCambiarPuntajeEvaluacionCuantitativaJurado(err)) {
            setEdicion(null);
            return;
          }
          const delCampo = getApiFieldErrors(err).find((e) => e.field === 'puntaje');
          setEdicion((actual) =>
            actual ? { ...actual, error: delCampo?.message ?? mensaje } : actual,
          );
        },
      },
    );
  }

  return { edicion, iniciar, cambiar, cancelar, guardar, guardando: isPending };
}
