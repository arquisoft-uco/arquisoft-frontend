import { useState } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { aplicarErroresDeApi } from '../utils/errores-api-usuario';

interface Opciones<T extends FieldValues, C extends Path<T>> {
  formulario: UseFormReturn<T>;
  campos: readonly C[];
  reiniciarMutacion: () => void;
  onCerrar: () => void;
  alias?: Record<string, readonly C[]>;
}

export function useEnvioFormularioUsuario<T extends FieldValues, C extends Path<T>>({
  formulario,
  campos,
  reiniciarMutacion,
  onCerrar,
  alias,
}: Opciones<T, C>) {
  const [resumenVisible, setResumenVisible] = useState(false);

  function irAlCampo(campo: string) {
    const destino = campos.find((c) => c === campo);
    if (destino) formulario.setFocus(destino);
  }

  function alInvalido() {
    setResumenVisible(true);
  }

  function alErrorDeApi(err: unknown, titulo: string) {
    toast.error(titulo, getApiErrorMessage(err, 'Inténtalo nuevamente.'));
    aplicarErroresDeApi(err, formulario.setError, campos, alias);
    setResumenVisible(true);
  }

  function cerrar() {
    formulario.reset();
    reiniciarMutacion();
    onCerrar();
  }

  return { resumenVisible, irAlCampo, alInvalido, alErrorDeApi, cerrar };
}
