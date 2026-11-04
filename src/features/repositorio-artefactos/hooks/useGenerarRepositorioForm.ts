import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGenerarRepositorioArtefacto } from './useGenerarRepositorioArtefacto';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage, hasApiErrorCode } from '../../../shared/utils/api-error';
import { aplicarErrorDeRepositorio } from '../utils/errores-repositorio';
import { CAMPOS, repositorioSchema, type RepositorioValues } from '../utils/repositorio-schema';

interface Opciones {
  onCerrar: () => void;
}

export function useGenerarRepositorioForm({ onCerrar }: Opciones) {
  const [resumenVisible, setResumenVisible] = useState(false);
  const form = useForm<RepositorioValues>({
    resolver: zodResolver(repositorioSchema),
    defaultValues: { nombreRepositorio: '', descripcion: '' },
    mode: 'onTouched',
  });
  const { isDirty } = form.formState;
  const { mutate, isPending, reset: reiniciarMutacion } = useGenerarRepositorioArtefacto();

  function irAlCampo(campo: string) {
    const destino = CAMPOS.find((c) => c === campo);
    if (destino) form.setFocus(destino);
  }

  function alError(err: unknown) {
    const respaldo = hasApiErrorCode(err, 'ADMINISTRADOR_NO_VIGENTE')
      ? 'Tu cuenta de administrador no está vigente.'
      : 'Inténtalo nuevamente.';
    toast.error('No se pudo generar el repositorio', getApiErrorMessage(err, respaldo));
    aplicarErrorDeRepositorio(err, form.setError);
    setResumenVisible(true);
  }

  function generar(valores: RepositorioValues) {
    setResumenVisible(false);
    mutate(valores, {
      onSuccess: () => {
        toast.success('Repositorio generado', 'El repositorio ya aparece en el listado.');
        onCerrar();
      },
      onError: alError,
    });
  }

  function cerrar() {
    form.reset();
    reiniciarMutacion();
    onCerrar();
  }

  const alInvalido = () => setResumenVisible(true);
  const enviar = form.handleSubmit(generar, alInvalido);

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
