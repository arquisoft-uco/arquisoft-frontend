import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSubirVersionRepositorio } from './useSubirVersionRepositorio';
import { useVersionesRepositorioArtefacto } from './useVersionesRepositorioArtefacto';
import { toast } from '../../../shared/hooks/useToast';
import { nombresDeDocumento, sugerirNombreDocumento } from '../utils/documentos-version';
import { aplicarErrorDeVersion, mensajeDeErrorDeVersion } from '../utils/errores-version';
import { CAMPOS_VERSION, versionSchema, type VersionValues } from '../utils/version-schema';

interface Opciones {
  repositorioId: string;
  onCerrar: () => void;
}

export function useSubirVersionForm({ repositorioId, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<VersionValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: { modo: 'nuevo', nombreDocumento: '', archivo: null },
    mode: 'onTouched',
  });
  const { isDirty, dirtyFields } = form.formState;
  const {
    mutate,
    isPending,
    reset: reiniciarMutacion,
    fase,
    porcentaje,
    faseDelError,
  } = useSubirVersionRepositorio(repositorioId);
  const { data: versiones, isLoading: cargandoDocumentos } =
    useVersionesRepositorioArtefacto(repositorioId);
  const documentosExistentes = nombresDeDocumento(versiones ?? []);

  function irAlCampo(campo: string) {
    const destino = CAMPOS_VERSION.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function elegirArchivo(archivo: File | null) {
    form.setValue('archivo', archivo, { shouldValidate: true, shouldDirty: true });
    if (archivo && form.getValues('modo') === 'nuevo' && !dirtyFields.nombreDocumento) {
      form.setValue('nombreDocumento', sugerirNombreDocumento(archivo.name));
    }
  }

  function cambiarModo(modo: VersionValues['modo']) {
    form.setValue('modo', modo, { shouldDirty: true });
    form.setValue('nombreDocumento', '');
    form.clearErrors('nombreDocumento');
    const archivo = form.getValues('archivo');
    if (modo === 'nuevo' && archivo) {
      form.setValue('nombreDocumento', sugerirNombreDocumento(archivo.name));
    }
  }

  function alError(err: unknown) {
    toast.error('No se pudo subir la versión', mensajeDeErrorDeVersion(err, faseDelError()));
    aplicarErrorDeVersion(err, form.setError);
    setResumenVisible(true);
  }

  function subir({ archivo, nombreDocumento, modo }: VersionValues) {
    if (!archivo) return;
    setResumenVisible(false);
    mutate(
      { archivo, nombreDocumento, nuevoDocumento: modo === 'nuevo' },
      {
        onSuccess: ({ numeroVersion }) => {
          toast.success(
            'Versión subida',
            `Versión ${numeroVersion} de «${nombreDocumento}» ya aparece en el listado.`,
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
    documentosExistentes,
    cargandoDocumentos,
    elegirArchivo,
    cambiarModo,
  };
}
