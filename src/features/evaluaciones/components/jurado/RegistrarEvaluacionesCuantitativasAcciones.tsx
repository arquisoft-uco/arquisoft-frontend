import { useState } from 'react';
import { useNavigate } from 'react-router';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import FormActions from '../../../../shared/components/ui/FormActions';

interface Props {
  formId: string;
  totalPares: number;
  enviando: boolean;
}

export default function RegistrarEvaluacionesCuantitativasAcciones({
  formId,
  totalPares,
  enviando,
}: Props) {
  const navigate = useNavigate();
  const [descartando, setDescartando] = useState(false);

  function cancelar() {
    if (totalPares > 0) setDescartando(true);
    else navigate('/evaluaciones');
  }

  return (
    <>
      <FormActions
        accion="Registrar evaluación"
        accionEnviando="Registrando…"
        formId={formId}
        sucio={totalPares > 0}
        sinCambios={totalPares === 0}
        enviando={enviando}
        onCancelar={cancelar}
      />
      {descartando && (
        <ConfirmDialog
          titulo="¿Descartar la evaluación?"
          descripcion="Se perderán las valoraciones que agregaste."
          variante="advertencia"
          labelConfirmar="Descartar"
          labelCancelar="Seguir editando"
          onConfirmar={() => navigate('/evaluaciones')}
          onCancelar={() => setDescartando(false)}
        />
      )}
    </>
  );
}
