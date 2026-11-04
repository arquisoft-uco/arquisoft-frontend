import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModificarRepositorioArtefacto } from './useModificarRepositorioArtefacto';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import type { RepositorioArtefacto } from '../models/RepositorioArtefacto';
import { aplicarErrorDeRepositorio } from '../utils/errores-repositorio';
import { CAMPOS, repositorioSchema, type RepositorioValues } from '../utils/repositorio-schema';

interface Opciones {
  repositorio: RepositorioArtefacto;
  onCerrar: () => void;
}

export function useModificarRepositorioForm({ repositorio, onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<RepositorioValues>({
    resolver: zodResolver(repositorioSchema),
    defaultValues: {
      nombreRepositorio: repositorio.nombreRepositorio,
      descripcion: repositorio.descripcion ?? '',
    },
    mode: 'onTouched',
  });
  const { isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useModificarRepositorioArtefacto();

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function alError(err: unknown) {
    const respaldo = hasApiErrorCode(err, 'ADMINISTRADOR_NO_VIGENTE')
      ? 'Tu cuenta de administrador no está vigente.'
      : 'Inténtalo nuevamente.';
    toast.error('No se pudo actualizar el repositorio', getApiErrorMessage(err, respaldo));
    aplicarErrorDeRepositorio(err, form.setError);
    if (hasApiErrorCode(err, 'REPOSITORIO_ARTEFACTO_NO_ENCONTRADO')) {
      onCerrar();
      return;
    }
    setResumenVisible(true);
  }

  function modificar(valores: RepositorioValues) {
    setResumenVisible(false);
    mutate(
      { repositorioId: repositorio.id, req: valores },
      {
        onSuccess: () => {
          toast.success('Repositorio actualizado', 'Los cambios ya aparecen en el listado.');
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
  const enviar = form.handleSubmit(modificar, alInvalido);

  return {
    form,
    enviar,
    enviando: isPending,
    cerrar,
    isDirty,
    resumenVisible,
    irAlCampo,
  };
}
