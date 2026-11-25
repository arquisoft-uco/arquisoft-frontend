import { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { TTL_CONTEXTO_CORTO_MS } from '../../../../shared/utils/contexto-temporal';
import { useEvaluacionFicha } from '../../hooks/useEvaluacionFicha';
import { useResumenFicha } from '../../hooks/useResumenFicha';
import {
  accionesEvaluacionRepresentante,
  evaluacionVigente,
  fichaAdmiteEvaluacion,
} from '../../utils/evaluacion-asistente';
import AsistenteEvaluacion from './AsistenteEvaluacion';
import DescartarEvaluacionBoton from './DescartarEvaluacionBoton';
import EstadosEvaluacionPanel from './EstadosEvaluacionPanel';
import EvaluacionesAnterioresPanel from './EvaluacionesAnterioresPanel';
import EvaluacionRegistradaTarjeta from './EvaluacionRegistradaTarjeta';
import IniciarEvaluacionBoton from './IniciarEvaluacionBoton';
import ObservacionesEvaluacionRepresentantePanel from './ObservacionesEvaluacionRepresentantePanel';
import PasosEvaluacionIndicador from './PasosEvaluacionIndicador';

const AVISO_DESCARTADA = 'No cuenta para la decisión del coordinador.';
const AVISO_DESCARTADA_SIN_ACCION =
  'Tu evaluación está descartada y la ficha ya no está disponible para evaluación; no hay acciones.';

interface Props {
  fichaPerfilId: string;
}

export default function RegistrarEvaluacionPanel({ fichaPerfilId }: Props) {
  const { data: evaluaciones, isLoading, isError, refetch } = useEvaluacionFicha(fichaPerfilId);
  const { resumen } = useResumenFicha(fichaPerfilId, TTL_CONTEXTO_CORTO_MS);
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
  const vigente = evaluacionVigente(evaluaciones ?? []);
  const anteriores = (evaluaciones ?? []).slice(0, -1).reverse();
  const fichaDisponible = fichaAdmiteEvaluacion(resumen?.estadoId);
  const acciones = accionesEvaluacionRepresentante({ vigente, fichaDisponible });

  if (!vigente) {
    return (
      <div className="flex flex-col gap-4">
        <PasosEvaluacionIndicador paso="iniciar" />
        <EmptyState
          icono={ClipboardCheck}
          titulo="Aún no se ha iniciado la evaluación"
          descripcion={
            fichaDisponible
              ? 'Inicia la evaluación para registrar sus observaciones y su estado.'
              : 'La ficha no está disponible para evaluación, por eso no puedes iniciarla.'
          }
          accion={
            fichaDisponible ? <IniciarEvaluacionBoton fichaPerfilId={fichaPerfilId} /> : undefined
          }
        />
        <EstadosEvaluacionPanel />
      </div>
    );
  }

  const verObservaciones = () => setAbierta(vigente);

  function tarjeta(actual: EvaluacionFichaPerfil) {
    if (acciones.principal === 'reanudar' || acciones.descartadaSinAccion) {
      return (
        <EvaluacionRegistradaTarjeta
          titulo="Evaluación descartada"
          evaluacion={actual}
          aviso={acciones.descartadaSinAccion ? AVISO_DESCARTADA_SIN_ACCION : AVISO_DESCARTADA}
          acciones={
            acciones.principal === 'reanudar' ? (
              <IniciarEvaluacionBoton fichaPerfilId={fichaPerfilId} modo="reanudar" />
            ) : undefined
          }
          onVerObservaciones={verObservaciones}
        />
      );
    }
    if (acciones.principal === 'evaluar') {
      return (
        <AsistenteEvaluacion
          evaluacion={actual}
          fichaPerfilId={fichaPerfilId}
          onVerObservaciones={verObservaciones}
          accionTarjeta={
            acciones.puedeDescartar ? (
              <DescartarEvaluacionBoton fichaPerfilId={fichaPerfilId} evaluacionId={actual.id} />
            ) : undefined
          }
        />
      );
    }
    return (
      <EvaluacionRegistradaTarjeta
        titulo="Evaluación registrada"
        evaluacion={actual}
        onVerObservaciones={verObservaciones}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      {tarjeta(vigente)}
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
