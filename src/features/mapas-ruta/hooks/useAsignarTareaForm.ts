import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAsesoresProyecto } from './useAsesoresProyecto';
import { useAsignarTarea } from './useAsignarTarea';
import type { MapaRuta } from '../models/MapaRuta';
import { opcionesAsesorTarea } from '../utils/asesores-tarea';
import { campoDeErrorAsignarTarea, mensajeErrorAsignarTarea } from '../utils/errores-mapa-ruta';
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
  mapa: MapaRuta;
  onCerrar: () => void;
}

export function useAsignarTareaForm({ mapa, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<InformacionTareaValues>({
    resolver: zodResolver(informacionTareaSchema),
    defaultValues: { descripcion: '', asesor: '' },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;

  const asesores = useAsesoresProyecto(mapa.proyectoGradoId);
  const { mutate, isPending, reset: reiniciarMutacion } = useAsignarTarea();

  const opcionesAsesor = opcionesAsesorTarea(asesores.data ?? []);
  const cargandoAsesores = asesores.isLoading;
  const errorAsesores = asesores.isError;

  function reintentarAsesores() {
    void asesores.refetch();
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
    const mensaje = mensajeErrorAsignarTarea(err);
    toast.error('No se pudo asignar la tarea', mensaje);
    if (hasApiErrorCode(err, 'MAPA_RUTA_NO_ENCONTRADO')) {
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
      const campo = campoDeErrorAsignarTarea(err);
      if (campo) form.setError(campo, { message: mensaje });
    }
    setResumenVisible(true);
  }

  function asignar(valores: InformacionTareaValues) {
    setResumenVisible(false);
    mutate(
      {
        mapaRutaId: mapa.id,
        req: { descripcion: valores.descripcion, asesorId: valores.asesor },
      },
      {
        onSuccess: () => {
          toast.success('Tarea asignada', 'Ya aparece en tu listado de tareas.');
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

  const enviar = form.handleSubmit(asignar, () => setResumenVisible(true));

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
