import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '../../../shared/hooks/useToast';
import type { ArtefactoEstudiante } from '../models/ArtefactoEstudiante';
import {
  aplicarErrorDeVersionArtefacto,
  mensajeDeErrorDeVersionArtefacto,
} from '../utils/errores-version-artefacto';
import {
  CAMPOS_VERSION_ARTEFACTO,
  versionArtefactoSchema,
  type VersionArtefactoValues,
} from '../utils/version-artefacto-schema';
import { useSubirVersionArtefacto } from './useSubirVersionArtefacto';

interface Opciones {
  artefacto: ArtefactoEstudiante;
  onCerrar: () => void;
}

export function useSubirVersionArtefactoForm({ artefacto, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const [errorDeNegocio, setErrorDeNegocio] = useState<string | null>(null);
  const form = useForm<VersionArtefactoValues>({
    resolver: zodResolver(versionArtefactoSchema),
    defaultValues: { archivo: null },
    mode: 'onTouched',
  });
  const { isDirty } = form.formState;
  const {
    mutate,
    isPending,
    reset: reiniciarMutacion,
    fase,
    porcentaje,
    faseDelError,
  } = useSubirVersionArtefacto(artefacto.id);

  function irAlCampo(campo: string) {
    const destino = CAMPOS_VERSION_ARTEFACTO.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function elegirArchivo(archivo: File | null) {
    form.setValue('archivo', archivo, { shouldValidate: true, shouldDirty: true });
  }

  function alError(err: unknown) {
    const fallida = faseDelError();
    toast.error('No se pudo subir la versión', mensajeDeErrorDeVersionArtefacto(err, fallida));
    setErrorDeNegocio(aplicarErrorDeVersionArtefacto(err, fallida, form.setError));
    setResumenVisible(true);
  }

  function subir({ archivo }: VersionArtefactoValues) {
    if (!archivo) return;
    setResumenVisible(false);
    setErrorDeNegocio(null);
    mutate(
      { archivo },
      {
        onSuccess: ({ version }) => {
          toast.success(
            'Versión subida',
            `Versión ${version} de «${artefacto.nombreDocumento}» registrada.`,
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
    setErrorDeNegocio(null);
    onCerrar();
  }

  const alInvalido = () => setResumenVisible(true);
  const enviar = form.handleSubmit(subir, alInvalido);

  return {
    form,
    enviar,
    enviando: isPending,
    fase,
    porcentaje,
    cerrar,
    isDirty,
    resumenVisible,
    irAlCampo,
    elegirArchivo,
    errorDeNegocio,
  };
}
