import { useState } from 'react';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { coincideFrase, FRASE_CONFIRMACION_FINALIZACION } from '../utils/frase-confirmacion';
import { useFinalizarProyectoGrado } from './useFinalizarProyectoGrado';

interface Opciones {
  proyectoGradoId: string;
  onFinalizado: () => void;
}

export function useFinalizacionProyecto({ proyectoGradoId, onFinalizado }: Opciones) {
  const { mutate, isPending: finalizando, reset: reiniciarMutacion } = useFinalizarProyectoGrado();
  const [abierto, setAbierto] = useState(false);
  const [frase, setFrase] = useState('');
  const fraseCoincide = coincideFrase(frase, FRASE_CONFIRMACION_FINALIZACION);

  function solicitar() {
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    setFrase('');
    reiniciarMutacion();
  }

  function confirmar() {
    if (!fraseCoincide) return;
    mutate(
      { proyectoGradoId },
      {
        onSuccess: () => {
          toast.success('Proyecto finalizado', 'El proyecto de grado quedó finalizado.');
          cerrar();
          onFinalizado();
        },
        onError: (err) => {
          toast.error(
            'No se pudo finalizar el proyecto',
            getApiErrorMessage(err, 'No se pudo finalizar el proyecto de grado.'),
          );
        },
      },
    );
  }

  return {
    abierto,
    solicitar,
    cerrar,
    frase,
    cambiarFrase: setFrase,
    fraseCoincide,
    finalizando,
    confirmar,
  };
}
