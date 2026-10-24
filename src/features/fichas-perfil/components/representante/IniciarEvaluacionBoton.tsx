import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useRegistrarEvaluacion } from '../../hooks/useRegistrarEvaluacion';

const MENSAJE_FALLBACK = 'Ocurrió un error al registrar la evaluación. Intenta nuevamente.';

interface Props {
  fichaPerfilId: string;
}

export default function IniciarEvaluacionBoton({ fichaPerfilId }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const { mutate, isPending } = useRegistrarEvaluacion(fichaPerfilId);

  function confirmar() {
    mutate(undefined, {
      onSuccess: () => {
        toast.success('Evaluación iniciada', 'Se registró la evaluación de la ficha.');
        setConfirmando(false);
      },
      onError: (err) => {
        toast.error('Error al iniciar la evaluación', getApiErrorMessage(err, MENSAJE_FALLBACK));
        setConfirmando(false);
      },
    });
  }

  return (
    <>
      <Button icono={ClipboardCheck} disabled={isPending} onClick={() => setConfirmando(true)}>
        Iniciar evaluación
      </Button>
      {confirmando && (
        <ConfirmDialog
          titulo="¿Iniciar evaluación?"
          descripcion="Se registrará una nueva evaluación para esta ficha de perfil. Esta acción no se puede deshacer."
          labelConfirmar="Iniciar evaluación"
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
