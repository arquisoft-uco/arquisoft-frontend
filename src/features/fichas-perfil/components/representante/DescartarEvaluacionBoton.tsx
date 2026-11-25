import { useState } from 'react';
import { Ban } from 'lucide-react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import Button from '../../../../shared/components/ui/Button';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useDescartarEvaluacion } from '../../hooks/useDescartarEvaluacion';

const MENSAJE_FALLBACK = 'Ocurrió un error al descartar la evaluación. Intenta nuevamente.';
const CONSECUENCIAS = [
  'La evaluación deja de contar para la decisión del coordinador.',
  'No verás los ítems ni los estados de la ficha, ni podrás editar observaciones, hasta reanudarla.',
  'Tus observaciones se conservan.',
  'Puedes reanudarla mientras la ficha siga disponible para evaluación.',
];

interface Props {
  fichaPerfilId: string;
  evaluacionId: string;
}

export default function DescartarEvaluacionBoton({ fichaPerfilId, evaluacionId }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const { mutate, isPending } = useDescartarEvaluacion(fichaPerfilId);

  function confirmar() {
    mutate(evaluacionId, {
      onSuccess: () => {
        toast.success(
          'Evaluación descartada',
          'Puedes reanudarla mientras la ficha siga disponible para evaluación.',
        );
        setConfirmando(false);
      },
      onError: (err) => {
        toast.error('Error al descartar la evaluación', getApiErrorMessage(err, MENSAJE_FALLBACK));
        setConfirmando(false);
      },
    });
  }

  return (
    <>
      <Button
        variante="peligroContorno"
        icono={Ban}
        disabled={isPending}
        onClick={() => setConfirmando(true)}
      >
        Descartar evaluación
      </Button>
      {confirmando && (
        <ConfirmDialog
          titulo="¿Descartar evaluación?"
          consecuencias={CONSECUENCIAS}
          labelConfirmar="Descartar evaluación"
          labelCancelar="Cancelar"
          variante="peligro"
          cargando={isPending}
          onConfirmar={confirmar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  );
}
