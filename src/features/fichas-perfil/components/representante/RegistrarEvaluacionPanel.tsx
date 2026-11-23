import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useEvaluacionFicha } from '../../hooks/useEvaluacionFicha';
import { evaluacionEnEstadoFinal } from '../../utils/evaluacion-asistente';
import AsistenteEvaluacion from './AsistenteEvaluacion';
import EstadosEvaluacionPanel from './EstadosEvaluacionPanel';
import EvaluacionesAnterioresPanel from './EvaluacionesAnterioresPanel';
import EvaluacionRegistradaTarjeta from './EvaluacionRegistradaTarjeta';
import IniciarEvaluacionBoton from './IniciarEvaluacionBoton';
import ObservacionesEvaluacionRepresentantePanel from './ObservacionesEvaluacionRepresentantePanel';
import PasosEvaluacionIndicador from './PasosEvaluacionIndicador';

interface Props {
  fichaPerfilId: string;
}

export default function RegistrarEvaluacionPanel({ fichaPerfilId }: Props) {
  const { data: evaluaciones, isLoading, isError, refetch } = useEvaluacionFicha(fichaPerfilId);
  const [abierta, setAbierta] = useState<EvaluacionFichaPerfil | null>(null);

  if (isLoading) return <Skeleton variante="tarjetas" etiqueta="Cargando evaluación…" />;

  if (isError) {
    return (
      <ErrorState
        titulo="No se pudo cargar la evaluación"
        descripcion="Inténtalo nuevamente."
        onReintentar={refetch}
      />
    );
  }

  // El backend ordena por fechaCreacion ascendente (CA-9 de HU-182): la última es la vigente.
  const vigente = evaluaciones?.[evaluaciones.length - 1];
  const anteriores = (evaluaciones ?? []).slice(0, -1).reverse();

  if (!vigente) {
    return (
      <div className="flex flex-col gap-4">
        <PasosEvaluacionIndicador paso="iniciar" />
        <EmptyState
          icono={ClipboardCheck}
          titulo="Aún no se ha iniciado la evaluación"
          descripcion="Inicia la evaluación para registrar sus observaciones y su estado."
          accion={<IniciarEvaluacionBoton fichaPerfilId={fichaPerfilId} />}
        />
        <EstadosEvaluacionPanel />
      </div>
    );
  }

  const verObservaciones = () => setAbierta(vigente);

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      {evaluacionEnEstadoFinal(vigente) ? (
        <EvaluacionRegistradaTarjeta
          titulo="Evaluación registrada"
          evaluacion={vigente}
          onVerObservaciones={verObservaciones}
        />
      ) : (
        <AsistenteEvaluacion
          evaluacion={vigente}
          fichaPerfilId={fichaPerfilId}
          onVerObservaciones={verObservaciones}
        />
      )}
      <EvaluacionesAnterioresPanel evaluaciones={anteriores} onVerObservaciones={setAbierta} />
      <EstadosEvaluacionPanel />
      {abierta && (
        <ObservacionesEvaluacionRepresentantePanel
          evaluacion={abierta}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </div>
  );
}
