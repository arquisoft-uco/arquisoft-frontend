import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import CambiarEstadoObservacionDialog from './CambiarEstadoObservacionDialog';
import CerrarRevisionDialog from './CerrarRevisionDialog';
import EliminarObservacionDialog from './EliminarObservacionDialog';
import EnviarRevisionDialog from './EnviarRevisionDialog';

export interface Decision {
  observacion: ObservacionRevision;
  estado: 'CERRADA' | 'REABIERTA';
  version: VersionArtefacto;
}

interface Props {
  version: VersionArtefacto;
  revisionAsesorId: string;
  aEliminar: ObservacionRevision | null;
  decision: Decision | null;
  enviando: boolean;
  cerrando: boolean;
  onCerrarEliminar: () => void;
  onCerrarDecision: () => void;
  onCerrarEnvio: () => void;
  onCerrarCierre: () => void;
  onSalir: () => void;
}

export default function DialogosGestionRevision({
  version,
  revisionAsesorId,
  aEliminar,
  decision,
  enviando,
  cerrando,
  onCerrarEliminar,
  onCerrarDecision,
  onCerrarEnvio,
  onCerrarCierre,
  onSalir,
}: Props) {
  return (
    <>
      {aEliminar && (
        <EliminarObservacionDialog observacionId={aEliminar.id} onCerrar={onCerrarEliminar} />
      )}
      {decision && (
        <CambiarEstadoObservacionDialog
          observacion={decision.observacion}
          estado={decision.estado}
          version={decision.version}
          revisionAsesorId={decision.observacion.revisionAsesorId}
          onCerrar={onCerrarDecision}
          onSalir={onSalir}
        />
      )}
      {enviando && (
        <EnviarRevisionDialog
          version={version}
          revisionAsesorId={revisionAsesorId}
          onCerrar={onCerrarEnvio}
          onSalir={onSalir}
        />
      )}
      {cerrando && (
        <CerrarRevisionDialog
          version={version}
          revisionAsesorId={revisionAsesorId}
          onCerrar={onCerrarCierre}
          onSalir={onSalir}
        />
      )}
    </>
  );
}
