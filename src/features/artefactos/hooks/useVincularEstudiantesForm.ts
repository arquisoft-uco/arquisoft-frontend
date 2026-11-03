import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVincularEstudiantes } from './useVincularEstudiantes';
import { useEstudiantesVinculables } from './useEstudiantesVinculables';
import type { ArtefactoAsesor } from '../models/ArtefactoAsesor';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { artefactoYaNoDisponible } from '../utils/errores-estudiantes-artefacto';
import {
  CODIGOS_VINCULAR_ESTUDIANTES,
  ETIQUETAS_VINCULAR_ESTUDIANTES,
  vincularEstudiantesSchema,
  type VincularEstudiantesValues,
} from '../utils/estudiantes-artefacto-schema';

const CAMPOS = Object.keys(ETIQUETAS_VINCULAR_ESTUDIANTES) as (keyof VincularEstudiantesValues)[];

const MENSAJE_ERROR_POR_DEFECTO = 'Verifica los datos e inténtalo nuevamente.';

interface Opciones {
  artefacto: ArtefactoAsesor;
  onVolver?: () => void;
  onSalir: () => void;
}

export function useVincularEstudiantesForm({ artefacto, onVolver, onSalir }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<VincularEstudiantesValues>({
    resolver: zodResolver(vincularEstudiantesSchema),
    defaultValues: { estudiantes: [] },
    mode: 'onTouched',
  });
  const { errors, isDirty } = form.formState;

  const vinculables = useEstudiantesVinculables(artefacto.proyectoGrado, artefacto.id);
  const { mutate, isPending, reset: reiniciarMutacion } = useVincularEstudiantes();

  const errores = resumenVisible
    ? CAMPOS.flatMap((campo) => {
        const mensaje = errors[campo]?.message;
        return mensaje ? [{ campo, etiqueta: ETIQUETAS_VINCULAR_ESTUDIANTES[campo], mensaje }] : [];
      })
    : [];

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function vincular(valores: VincularEstudiantesValues) {
    setResumenVisible(false);
    mutate(
      { artefactoId: artefacto.id, estudiantes: valores.estudiantes },
      {
        onSuccess: () => {
          const cantidad = valores.estudiantes.length;
          toast.success(
            'Estudiantes vinculados',
            `${cantidad === 1 ? 'Se vinculó 1 estudiante' : `Se vincularon ${cantidad} estudiantes`} a «${artefacto.nombreDocumento}».`,
          );
          form.reset();
          onVolver?.();
        },
        onError: (err) => {
          const mensaje = getApiErrorMessage(err, MENSAJE_ERROR_POR_DEFECTO);
          toast.error('No se pudieron vincular los estudiantes', mensaje);
          if (CODIGOS_VINCULAR_ESTUDIANTES.some((c) => hasApiErrorCode(err, c))) {
            form.setError('estudiantes', { message: mensaje });
          }
          if (artefactoYaNoDisponible(err)) onSalir();
        },
      },
    );
  }

  function cerrar() {
    form.reset();
    reiniciarMutacion();
    onVolver?.();
  }

  const enviar = form.handleSubmit(vincular, () => setResumenVisible(true));

  return {
    form,
    enviar,
    enviando: isPending,
    cerrar,
    isDirty,
    vinculables,
    errores,
    irAlCampo,
  };
}
