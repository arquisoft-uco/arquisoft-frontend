import { useState } from 'react';
import { ClipboardCheck, RotateCcw } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRegistrarEvaluacion } from '../../hooks/useRegistrarEvaluacion';

type Modo = 'iniciar' | 'reanudar';

const TEXTOS: Record<
  Modo,
  {
    boton: string;
    titulo: string;
    descripcion: string;
    exito: string;
    exitoMensaje: string;
    error: string;
    fallback: string;
  }
> = {
  iniciar: {
    boton: 'Iniciar evaluación',
    titulo: '¿Iniciar evaluación?',
    descripcion:
      'Se registrará una nueva evaluación para esta ficha de perfil. Esta acción no se puede deshacer.',
    exito: 'Evaluación iniciada',
    exitoMensaje: 'Se registró la evaluación de la ficha.',
    error: 'Error al iniciar la evaluación',
    fallback: 'Ocurrió un error al registrar la evaluación. Intenta nuevamente.',
  },
  reanudar: {
    boton: 'Reanudar evaluación',
    titulo: '¿Reanudar evaluación?',
    descripcion: 'Retomarás tu evaluación con sus observaciones.',
    exito: 'Evaluación reanudada',
    exitoMensaje: 'Puedes continuar con tu evaluación de la ficha.',
    error: 'Error al reanudar la evaluación',
    fallback: 'Ocurrió un error al reanudar la evaluación. Intenta nuevamente.',
  },
};

interface Props {
  fichaPerfilId: string;
  modo?: Modo;
}

export default function IniciarEvaluacionBoton({ fichaPerfilId, modo = 'iniciar' }: Props) {
  const textos = TEXTOS[modo];
  const [confirmando, setConfirmando] = useState(false);
  const { mutate, isPending } = useRegistrarEvaluacion(fichaPerfilId);

  function confirmar() {
    mutate(undefined, {
      onSuccess: () => {
        toast.success(textos.exito, textos.exitoMensaje);
        setConfirmando(false);
      },
      onError: (err) => {
        toast.error(textos.error, getApiErrorMessage(err, textos.fallback));
        setConfirmando(false);
      },
    });
  }

  return (
    <>
      <Button
        icono={modo === 'reanudar' ? RotateCcw : ClipboardCheck}
        disabled={isPending}
        onClick={() => setConfirmando(true)}
      >
        {textos.boton}
      </Button>
      {confirmando && (
        <ConfirmDialog
          titulo={textos.titulo}
          descripcion={textos.descripcion}
          labelConfirmar={textos.boton}
          labelCancelar="Cancelar"
          variante="advertencia"
          cargando={isPending}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  );
}
