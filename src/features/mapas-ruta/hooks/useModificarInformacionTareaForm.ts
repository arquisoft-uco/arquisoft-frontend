import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAsesoresProyecto } from './useAsesoresProyecto';
import { useMapaRutaEstudiante } from './useMapaRutaEstudiante';
import { useModificarInformacionTarea } from './useModificarInformacionTarea';
import type { Tarea } from '../models/Tarea';
import { opcionesAsesorTarea } from '../utils/asesores-tarea';
import { campoDeErrorModificarTarea, mensajeErrorModificarTarea } from '../utils/errores-mapa-ruta';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';
import { LIMITES, opcionRequerida, textoRequerido } from '../../../shared/validation';

const schema = z.object({
  descripcion: textoRequerido(LIMITES.TAREA_DESCRIPCION_MAX),
  asesor: opcionRequerida(),
});

export type ModificarInformacionTareaValues = z.infer<typeof schema>;

const ETIQUETAS: Record<keyof ModificarInformacionTareaValues, string> = {
  descripcion: 'Descripción',
  asesor: 'Asesor',
};

const CAMPOS = Object.keys(ETIQUETAS) as (keyof ModificarInformacionTareaValues)[];

function comoCampo(campo: string): keyof ModificarInformacionTareaValues | undefined {
  return CAMPOS.find((c) => c === campo);
}

interface Opciones {
  tarea: Tarea;
  onCerrar: () => void;
}

export function useModificarInformacionTareaForm({ tarea, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<ModificarInformacionTareaValues>({
    resolver: zodResolver(schema),
    defaultValues: { descripcion: tarea.descripcion, asesor: tarea.asesor.id },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;

  const {
    mapa,
    cargando: cargandoMapa,
    sinMapa,
    hayError: errorMapa,
    reintentar,
  } = useMapaRutaEstudiante();
  const asesores = useAsesoresProyecto(mapa?.proyectoGradoId);
  const { mutate, isPending, reset: reiniciarMutacion } = useModificarInformacionTarea();

  const opcionesAsesor = opcionesAsesorTarea(tarea.asesor, asesores.data ?? []);
  const cargandoAsesores = cargandoMapa || asesores.isLoading;
  const errorAsesores = errorMapa || sinMapa || asesores.isError;

  function reintentarAsesores() {
    if (errorMapa || sinMapa) void reintentar();
    if (asesores.isError) void asesores.refetch();
  }

  const asesor = form.watch('asesor');

  function elegirAsesor(id: string) {
    form.setValue('asesor', id, { shouldDirty: true, shouldValidate: true });
  }

  const errores = resumenVisible
    ? CAMPOS.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    if (campo === 'descripcion') form.setFocus('descripcion');
  }

  function alError(err: unknown) {
    const mensaje = mensajeErrorModificarTarea(err);
    toast.error('No se pudo actualizar la tarea', mensaje);
    if (hasApiErrorCode(err, 'TAREA_NO_ENCONTRADA')) {
      onCerrar();
      return;
    }
    let hubo = false;
    for (const fe of getApiFieldErrors(err)) {
      const campo = comoCampo(fe.field);
      if (campo) {
        form.setError(campo, { message: fe.message });
        hubo = true;
      }
    }
    if (!hubo) {
      const campo = campoDeErrorModificarTarea(err);
      if (campo) form.setError(campo, { message: mensaje });
    }
    setResumenVisible(true);
  }

  function modificar(valores: ModificarInformacionTareaValues) {
    setResumenVisible(false);
    mutate(
      { tareaId: tarea.id, req: { descripcion: valores.descripcion, asesorId: valores.asesor } },
      {
        onSuccess: () => {
          toast.success(
            'Tarea actualizada',
            'Los cambios ya se ven en el detalle y en tu listado de tareas.',
          );
          onCerrar();
        },
        onError: alError,
      },
    );
  }

  function cerrar() {
    form.reset();
    reiniciarMutacion();
    onCerrar();
  }

  const enviar = form.handleSubmit(modificar, () => setResumenVisible(true));

  return {
    form,
    enviar,
    enviando: isPending,
    cerrar,
    isDirty,
    errores,
    resumenVisible,
    irAlCampo,
    asesor,
    elegirAsesor,
    opcionesAsesor,
    cargandoAsesores,
    errorAsesores,
    reintentarAsesores,
  };
}
