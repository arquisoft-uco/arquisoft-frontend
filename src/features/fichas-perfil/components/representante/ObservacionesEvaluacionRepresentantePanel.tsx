import { useState } from 'react';
import ConfirmDialog from '../../../../shared/components/ConfirmDialog';
import { toast } from '../../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useObservacionesEvaluacionRepresentante } from '../../hooks/useObservacionesEvaluacionRepresentante';
import { useRemoverObservacionEvaluacion } from '../../hooks/useRemoverObservacionEvaluacion';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import type { ObservacionEvaluacion } from '../../models/ObservacionEvaluacion';
import ObservacionesEvaluacionPanelBase from '../ObservacionesEvaluacionPanelBase';
import EditarObservacionEvaluacionForm from './EditarObservacionEvaluacionForm';

const CONSECUENCIAS = [
  'La observación dejará de aparecer en esta evaluación.',
  'Podrás volver a agregar el mismo texto.',
  'No se puede deshacer.',
];

interface Props {
  evaluacion: EvaluacionFichaPerfil;
  onCerrar: () => void;
}

export default function ObservacionesEvaluacionRepresentantePanel({ evaluacion, onCerrar }: Props) {
  const [enEdicion, setEnEdicion] = useState<ObservacionEvaluacion | null>(null);
  const [porEliminar, setPorEliminar] = useState<ObservacionEvaluacion | null>(null);
  const { observaciones, isLoading, cargado, isError, error, refetch } =
    useObservacionesEvaluacionRepresentante(evaluacion.fichaPerfilId, evaluacion.id);
  const remover = useRemoverObservacionEvaluacion(evaluacion.fichaPerfilId, evaluacion.id);

  function handleConfirmarEliminar() {
    if (!porEliminar) return;
    remover.mutate(porEliminar.id, {
      onSuccess: () => {
        toast.success('Observación eliminada', 'La observación se quitó de la evaluación.');
        setPorEliminar(null);
      },
      onError: (err) => {
        toast.error(
          'No se pudo eliminar la observación',
          getApiErrorMessage(err, 'Inténtalo nuevamente.'),
        );
        setPorEliminar(null);
      },
    });
  }

  function handleCancelarEliminar() {
    if (remover.isPending) return;
    setPorEliminar(null);
  }

  return (
    <>
      <ObservacionesEvaluacionPanelBase
        descripcion="Observaciones que registraste en esta evaluación"
        estadoId={evaluacion.estadoEvaluacionId}
        estadoNombre={evaluacion.estadoEvaluacionNombre}
        observaciones={observaciones}
        isLoading={isLoading}
        cargado={cargado}
        isError={isError}
        error={error}
        onReintentar={refetch}
        descripcionVacia="Cuando las registres, las verás aquí."
        onCerrar={onCerrar}
        onEditar={setEnEdicion}
        onEliminar={setPorEliminar}
      />
      {enEdicion && (
        <EditarObservacionEvaluacionForm
          observacion={enEdicion}
          fichaPerfilId={evaluacion.fichaPerfilId}
          onCerrar={() => setEnEdicion(null)}
        />
      )}
      {porEliminar && (
        <ConfirmDialog
          variante="peligro"
          titulo="¿Eliminar observación?"
          descripcion={`«${porEliminar.observacion}»`}
          consecuencias={CONSECUENCIAS}
          labelConfirmar="Eliminar"
          cargando={remover.isPending}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={handleCancelarEliminar}
        />
      )}
    </>
  );
}
