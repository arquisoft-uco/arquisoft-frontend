import { useState } from 'react';
import { ClipboardCheck, MessageSquare } from 'lucide-react';
import { useEvaluacionesMiFicha } from '../../hooks/useEvaluacionesMiFicha';
import type { EvaluacionFichaPerfilEstudiante } from '../../models/EvaluacionFichaPerfilEstudiante';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Button from '../../../../shared/components/ui/Button';
import EmptyState from '../../../../shared/components/ui/EmptyState';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import TarjetaEvaluacionFicha from '../TarjetaEvaluacionFicha';
import ObservacionesEvaluacionPanel from './ObservacionesEvaluacionPanel';

export default function EvaluacionesMiFichaPanel() {
  const { evaluaciones, isLoading, cargado, isError, error, refetch, fichaPerfilIdDisponible } =
    useEvaluacionesMiFicha();
  const [abierta, setAbierta] = useState<EvaluacionFichaPerfilEstudiante | null>(null);

  if (!fichaPerfilIdDisponible) {
    return <AvisoNoDisponible recurso="evaluaciones de tu ficha de perfil" />;
  }

  if (isError) {
    return (
      <ErrorState
        titulo="No pudimos cargar las evaluaciones"
        descripcion="Inténtalo nuevamente."
        detalle={getApiErrorMessage(error, 'No se pudieron cargar las evaluaciones.')}
        onReintentar={refetch}
      />
    );
  }

  if (isLoading || !cargado) {
    return <Skeleton variante="tarjetas" etiqueta="Cargando evaluaciones…" />;
  }

  if (evaluaciones.length === 0) {
    return (
      <EmptyState
        icono={ClipboardCheck}
        titulo="Tu ficha aún no tiene evaluaciones"
        descripcion="Cuando el comité de currículum la evalúe, verás aquí el resultado."
      />
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {evaluaciones.map((evaluacion) => (
          <TarjetaEvaluacionFicha key={evaluacion.id} evaluacion={evaluacion}>
            <Button
              variante="secundario"
              tamano="sm"
              icono={MessageSquare}
              onClick={() => setAbierta(evaluacion)}
            >
              Ver observaciones
            </Button>
          </TarjetaEvaluacionFicha>
        ))}
      </ul>
      {abierta && (
        <ObservacionesEvaluacionPanel evaluacion={abierta} onCerrar={() => setAbierta(null)} />
      )}
    </>
  );
}
