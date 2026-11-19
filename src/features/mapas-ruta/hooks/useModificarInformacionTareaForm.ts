import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAsesoresProyecto } from './useAsesoresProyecto';
import { useMapaRutaEstudiante } from './useMapaRutaEstudiante';
import { useModificarInformacionTarea } from './useModificarInformacionTarea';
import type { Tarea } from '../models/Tarea';
import { opcionesAsesorTarea } from '../utils/asesores-tarea';
import { campoDeErrorModificarTarea, mensajeErrorModificarTarea } from '../utils/errores-mapa-ruta';
import {
  CAMPOS_INFORMACION_TAREA,
  ETIQUETAS_INFORMACION_TAREA,
  comoCampoInformacionTarea,
  informacionTareaSchema,
  type InformacionTareaValues,
} from '../utils/informacion-tarea';
import { toast } from '../../../shared/hooks/useToast';
import { getApiFieldErrors, hasApiErrorCode } from '../../../shared/utils/api-error';

interface Opciones {
  tarea: Tarea;
  onCerrar: () => void;
}

export function useModificarInformacionTareaForm({ tarea, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<InformacionTareaValues>({
    resolver: zodResolver(informacionTareaSchema),
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

  const opcionesAsesor = opcionesAsesorTarea(asesores.data ?? [], tarea.asesor);
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
    ? CAMPOS_INFORMACION_TAREA.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS_INFORMACION_TAREA[campo], mensaje }] : [];
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
      const campo = comoCampoInformacionTarea(fe.field);
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

  function modificar(valores: InformacionTareaValues) {
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
