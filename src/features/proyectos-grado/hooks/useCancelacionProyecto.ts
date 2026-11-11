import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage, getApiFieldErrors } from '../../../shared/utils/api-error';
import { LIMITES, textoRequerido } from '../../../shared/validation';
import { coincideFraseConfirmacion } from '../utils/frase-cancelacion';
import { useCancelarProyectoGrado } from './useCancelarProyectoGrado';

const schema = z.object({
  motivo: textoRequerido(LIMITES.MOTIVO_CANCELACION_PROYECTO_GRADO_MAX),
});

type FormValues = z.infer<typeof schema>;

export type PasoCancelacion = null | 'motivo' | 'confirmacion';

interface Opciones {
  proyectoGradoId: string;
  onCancelado: () => void;
}

export function useCancelacionProyecto({ proyectoGradoId, onCancelado }: Opciones) {
  const { mutate, isPending: cancelando, reset: reiniciarMutacion } = useCancelarProyectoGrado();
  const [paso, setPaso] = useState<PasoCancelacion>(null);
  const [frase, setFrase] = useState('');
  const formulario = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { motivo: '' },
    mode: 'onTouched',
  });
  const fraseCoincide = coincideFraseConfirmacion(frase);

  function solicitar() {
    setPaso('motivo');
  }

  async function continuar() {
    const valido = await formulario.trigger('motivo');
    if (valido) setPaso('confirmacion');
  }

  function volver() {
    setFrase('');
    setPaso('motivo');
  }

  function cerrar() {
    setPaso(null);
    setFrase('');
    formulario.reset();
    reiniciarMutacion();
  }

  function enviar(values: FormValues) {
    if (!fraseCoincide) return;
    mutate(
      { proyectoGradoId, motivo: values.motivo },
      {
        onSuccess: () => {
          toast.success('Proyecto cancelado', 'El proyecto de grado quedó cancelado.');
          cerrar();
          onCancelado();
        },
        onError: (err) => {
          toast.error(
            'No se pudo cancelar el proyecto',
            getApiErrorMessage(err, 'No se pudo cancelar el proyecto de grado.'),
          );
          const errorMotivo = getApiFieldErrors(err).find((e) => e.field === 'motivo');
          if (errorMotivo) {
            formulario.setError('motivo', { message: errorMotivo.message });
            volver();
          }
        },
      },
    );
  }

  return {
    paso,
    solicitar,
    continuar,
    volver,
    cerrar,
    formulario,
    frase,
    cambiarFrase: setFrase,
    fraseCoincide,
    cancelando,
    confirmar: formulario.handleSubmit(enviar),
  };
}
