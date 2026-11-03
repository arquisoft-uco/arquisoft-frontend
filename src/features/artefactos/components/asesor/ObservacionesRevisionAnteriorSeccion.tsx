import Badge from '../../../../shared/components/ui/Badge';
import ErrorState from '../../../../shared/components/ui/ErrorState';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import type { RevisionAnterior } from '../../hooks/useRevisionAnterior';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { ESTADO_OBSERVACION_SOLUCIONADA } from '../../utils/decision-observacion';
import { textoContadorSinCerrar } from '../../utils/observaciones-revision-anterior';
import ListaObservacionesRevision from '../ListaObservacionesRevision';
import AccionesObservacionMenu from './AccionesObservacionMenu';

const TITULO = 'Observaciones de la revisión anterior';

interface Props {
  anterior: RevisionAnterior;
  onDecidir: (
    version: VersionArtefacto,
    observacion: ObservacionRevision,
    estado: 'CERRADA' | 'REABIERTA',
  ) => void;
}

export default function ObservacionesRevisionAnteriorSeccion({ anterior, onDecidir }: Props) {
  if (!anterior.visible) return null;
  const { versionAnterior, observaciones } = anterior;

  function accionesDe(observacion: ObservacionRevision) {
    if (
      !anterior.puedeDecidir ||
      !versionAnterior ||
      observacion.estadoId !== ESTADO_OBSERVACION_SOLUCIONADA
    ) {
      return undefined;
    }
    return (
      <AccionesObservacionMenu
        observacion={observacion}
        modo="decidir"
        puedeReabrir={anterior.situacion === 'disponible'}
        onDecidir={(o, estado) => onDecidir(versionAnterior, o, estado)}
      />
    );
  }

  return (
    <section
      aria-labelledby="observaciones-revision-anterior"
      className="flex flex-col gap-3 border-t border-border pt-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="observaciones-revision-anterior" className="text-sm font-semibold text-on-surface">
          {TITULO}
        </h3>
        {!anterior.isError && observaciones && (
          <Badge variante={anterior.sinCerrar > 0 ? 'advertencia' : 'exito'}>
            {textoContadorSinCerrar(anterior)}
          </Badge>
        )}
      </div>
      {anterior.textoAviso && <Notice variante="info">{anterior.textoAviso}</Notice>}
      {anterior.isError ? (
        <ErrorState
          titulo="No pudimos cargar las observaciones de la revisión anterior"
          descripcion="Inténtalo nuevamente."
          detalle={getApiErrorMessage(anterior.error, 'No se pudieron cargar las observaciones.')}
          onReintentar={() => void anterior.refetch()}
        />
      ) : !observaciones ? (
        <Skeleton variante="lineas" etiqueta="Cargando observaciones de la revisión anterior…" />
      ) : (
        <ListaObservacionesRevision
          observaciones={observaciones}
          acciones={accionesDe}
          etiqueta={TITULO}
        />
      )}
    </section>
  );
}
