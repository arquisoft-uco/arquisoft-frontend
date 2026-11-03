import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAsignarArtefacto } from './useAsignarArtefacto';
import { useEstudiantesProyectoCatalogo } from './useEstudiantesProyectoCatalogo';
import { useProyectosAsesorCatalogo } from './useProyectosAsesorCatalogo';
import { useVersionesRepositorioCatalogo } from './useVersionesRepositorioCatalogo';
import type { ArtefactoAReactivar } from '../models/ArtefactoAReactivar';
import { toast } from '../../../shared/hooks/useToast';
import {
  getApiErrorMessage,
  getApiFieldErrors,
  hasApiErrorCode,
} from '../../../shared/utils/api-error';
import {
  asignarArtefactoSchema,
  campoDeCodigoAsignarArtefacto,
  CODIGOS_ASIGNAR_ARTEFACTO,
  ETIQUETAS_ASIGNAR_ARTEFACTO,
  type AsignarArtefactoValues,
} from '../utils/asignar-artefacto-schema';

const CAMPOS = Object.keys(ETIQUETAS_ASIGNAR_ARTEFACTO) as (keyof AsignarArtefactoValues)[];

const MENSAJE_ERROR_POR_DEFECTO = 'Verifica los datos e inténtalo nuevamente.';

interface Opciones {
  onCerrar: () => void;
  onAsignado?: () => void;
  reactivar?: ArtefactoAReactivar;
}

export function useAsignarArtefactoForm({ onCerrar, onAsignado, reactivar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<AsignarArtefactoValues>({
    resolver: zodResolver(asignarArtefactoSchema),
    defaultValues: {
      proyectoGrado: reactivar?.proyectoGrado ?? '',
      versionRepositorioArtefacto: reactivar?.versionRepositorioArtefacto ?? '',
      estudiantes: [],
    },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;

  const proyectoGrado = useWatch({ control: form.control, name: 'proyectoGrado' });

  const proyectos = useProyectosAsesorCatalogo(!reactivar);
  const versiones = useVersionesRepositorioCatalogo(!reactivar);
  const estudiantes = useEstudiantesProyectoCatalogo(proyectoGrado);
  const { mutate, isPending, reset: reiniciarMutacion } = useAsignarArtefacto();

  const catalogoNoDisponible = reactivar
    ? !!proyectoGrado && estudiantes.isError
    : proyectos.isError || versiones.isError || (!!proyectoGrado && estudiantes.isError);

  const errores = resumenVisible
    ? CAMPOS.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS_ASIGNAR_ARTEFACTO[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function alCambiarProyecto() {
    form.setValue('estudiantes', []);
  }

  function asignar(valores: AsignarArtefactoValues) {
    setResumenVisible(false);
    mutate(
      {
        proyectoGrado: valores.proyectoGrado,
        versionRepositorioArtefacto: valores.versionRepositorioArtefacto,
        estudiantes: valores.estudiantes,
      },
      {
        onSuccess: () => {
          if (reactivar) {
            toast.success(
              'Artefacto reactivado',
              `«${reactivar.nombreDocumento}» volvió a estar activo en «${reactivar.nombreProyecto}».`,
            );
            onAsignado?.();
            onCerrar();
            return;
          }
          const version = versiones.versiones.find(
            (v) => v.id === valores.versionRepositorioArtefacto,
          );
          const proyecto = proyectos.proyectos.find((p) => p.id === valores.proyectoGrado);
          toast.success(
            'Artefacto asignado',
            `«${version?.nombreDocumento ?? 'El artefacto'} v${version?.numeroVersion ?? ''}» quedó asignado a «${proyecto?.titulo ?? 'el proyecto'}».`,
          );
          onAsignado?.();
          onCerrar();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, MENSAJE_ERROR_POR_DEFECTO);
          toast.error(
            reactivar ? 'No se pudo reactivar el artefacto' : 'No se pudo asignar el artefacto',
            mensaje,
          );
          const codigo = CODIGOS_ASIGNAR_ARTEFACTO.find((c) => hasApiErrorCode(err, c));
          const campo = codigo ? campoDeCodigoAsignarArtefacto(codigo) : undefined;
          if (campo) form.setError(campo, { message: mensaje });
          for (const { field, message } of getApiFieldErrors(err)) {
            const destino = CAMPOS.find((c) => c === field);
            if (destino) form.setError(destino, { message });
          }
        },
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
    catalogos: { proyectos, versiones, estudiantes },
    catalogoNoDisponible,
    errores,
    irAlCampo,
    alCambiarProyecto,
  };
}
