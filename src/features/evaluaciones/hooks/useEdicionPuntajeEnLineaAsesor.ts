import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors } from '../../../shared/utils/api-error';
import type { EdicionPuntajeEnLinea } from '../models/EdicionPuntajeEnLinea';
import type { EvaluacionCuantitativaAsesor } from '../models/EvaluacionCuantitativaAsesor';
import { crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema } from '../utils/cambiar-puntaje-evaluacion-cuantitativa-asesor-schema';
import {
  cierraPanelCambiarPuntajeEvaluacionCuantitativaAsesor,
  mensajeErrorCambiarPuntajeEvaluacionCuantitativaAsesor,
} from '../utils/errores-cambiar-puntaje-evaluacion-cuantitativa-asesor';
import { useCambiarPuntajeEvaluacionCuantitativaAsesor } from './useCambiarPuntajeEvaluacionCuantitativaAsesor';

export function useEdicionPuntajeEnLineaAsesor(evaluacionAsesorId: string) {
  const [edicion, setEdicion] = useState<EdicionPuntajeEnLinea | null>(null);
  const { mutate, isPending, reset } =
    useCambiarPuntajeEvaluacionCuantitativaAsesor(evaluacionAsesorId);

  function iniciar(fila: EvaluacionCuantitativaAsesor) {
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
    const validacion = crearCambiarPuntajeEvaluacionCuantitativaAsesorSchema(valorMaximo).safeParse(
      { puntaje: valor },
    );
    if (!validacion.success) {
      setEdicion({ ...edicion, error: validacion.error.issues[0]?.message });
      return;
    }
    mutate(
      { evaluacionCuantitativaAsesorId: filaId, puntaje: Number(validacion.data.puntaje.trim()) },
      {
        onSuccess: () => {
          toast.success('Puntaje cambiado', `El puntaje de "${nombreItem}" fue actualizado.`);
          setEdicion(null);
        },
        onError: (err) => {
          const mensaje = mensajeErrorCambiarPuntajeEvaluacionCuantitativaAsesor(err);
          toast.error('No se pudo cambiar el puntaje', mensaje);
          if (cierraPanelCambiarPuntajeEvaluacionCuantitativaAsesor(err)) {
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
