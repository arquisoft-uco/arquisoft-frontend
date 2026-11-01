import { useState } from 'react';
import { MessageSquarePlus, Send } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import Notice from '../../../../shared/components/ui/Notice';
import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import { usePuedeGestionarObservaciones } from '../../hooks/usePuedeGestionarObservaciones';
import { useUltimaVersionArtefacto } from '../../hooks/useUltimaVersionArtefacto';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { textoAvisoObservaciones } from '../../utils/aviso-observaciones';
import {
  ESTADO_OBSERVACION_SOLUCIONADA,
  situacionReapertura,
} from '../../utils/decision-observacion';
import { revisionAdmiteDecisionObservacion } from '../../utils/revision-version';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';
import AccionesObservacionMenu from './AccionesObservacionMenu';
import AgregarObservacionPanel from './AgregarObservacionPanel';
import CambiarEstadoObservacionDialog from './CambiarEstadoObservacionDialog';
import EliminarObservacionDialog from './EliminarObservacionDialog';
import EnviarRevisionDialog from './EnviarRevisionDialog';

interface Decision {
  observacion: ObservacionRevision;
  estado: 'CERRADA' | 'REABIERTA';
}

interface Props {
  revisionAsesorId: string;
  version: VersionArtefacto;
  editable: boolean;
  onCerrar: () => void;
}

export default function ObservacionesRevisionPanel({
  revisionAsesorId,
  version,
  editable,
  onCerrar,
}: Props) {
  const { data, isLoading, isError, error, refetch } = useObservacionesRevision(revisionAsesorId);
  const { omitidos } = usePuedeGestionarObservaciones();
  const [agregando, setAgregando] = useState(false);
  const [aEliminar, setAEliminar] = useState<ObservacionRevision | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);
  const omitido = omitidos?.has(version.artefacto) ?? false;
  const puedeDecidir =
    !editable && revisionAdmiteDecisionObservacion({ version, artefactoOmitido: omitido });
  const { ultimaVersion } = useUltimaVersionArtefacto(version.artefacto, puedeDecidir);
  const situacion = situacionReapertura({ version, ultimaVersion });

  if (agregando) {
    return (
      <AgregarObservacionPanel
        revisionAsesorId={revisionAsesorId}
        version={version}
        onVolver={() => setAgregando(false)}
        onSalir={onCerrar}
      />
    );
  }

  const textoAviso = textoAvisoObservaciones({
    editable,
    version,
    omitido,
    puedeDecidir,
    haySolucionadas: data?.some((o) => o.estadoId === ESTADO_OBSERVACION_SOLUCIONADA) ?? false,
    situacion,
  });

  function accionesDe(observacion: ObservacionRevision) {
    const modo = editable ? 'eliminar' : 'decidir';
    if (!editable && !(puedeDecidir && observacion.estadoId === ESTADO_OBSERVACION_SOLUCIONADA)) {
      return undefined;
    }
    return (
      <AccionesObservacionMenu
        observacion={observacion}
        modo={modo}
        puedeReabrir={situacion === 'disponible'}
        onEliminar={setAEliminar}
        onDecidir={(o, estado) => setDecision({ observacion: o, estado })}
      />
    );
  }

  return (
    <>
      <ObservacionesRevisionPanelBase
        descripcion={`«${version.nombreDocumento}» · Versión ${version.version}`}
        descripcionVacia={
          editable
            ? 'Agrega la primera observación de esta revisión.'
            : 'Aún no hay observaciones registradas en esta revisión.'
        }
        observaciones={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReintentar={() => void refetch()}
        onCerrar={onCerrar}
        aviso={textoAviso && <Notice variante="info">{textoAviso}</Notice>}
        barra={
          editable && (
            <div className="actions-row">
              <Button icono={MessageSquarePlus} onClick={() => setAgregando(true)}>
                Agregar observación
              </Button>
              <Button variante="secundario" icono={Send} onClick={() => setEnviando(true)}>
                Enviar revisión
              </Button>
            </div>
          )
        }
        acciones={accionesDe}
      />
      {aEliminar && (
        <EliminarObservacionDialog observacion={aEliminar} onCerrar={() => setAEliminar(null)} />
      )}
      {decision && (
        <CambiarEstadoObservacionDialog
          observacion={decision.observacion}
          estado={decision.estado}
          version={version}
          revisionAsesorId={revisionAsesorId}
          onCerrar={() => setDecision(null)}
          onSalir={onCerrar}
        />
      )}
      {enviando && (
        <EnviarRevisionDialog
          version={version}
          revisionAsesorId={revisionAsesorId}
          onCerrar={() => setEnviando(false)}
          onSalir={onCerrar}
        />
      )}
    </>
  );
}
