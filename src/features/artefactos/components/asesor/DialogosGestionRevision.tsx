import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import CambiarEstadoObservacionDialog from './CambiarEstadoObservacionDialog';
import CerrarRevisionDialog from './CerrarRevisionDialog';
import EliminarObservacionDialog from './EliminarObservacionDialog';
import EliminarRevisionDialog from './EliminarRevisionDialog';
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
  onCerrarEliminarRevision: () => void;
  onSalir: () => void;
  eliminandoRevision: boolean;
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
  onCerrarEliminarRevision,
  onSalir,
  eliminandoRevision,
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
      {eliminandoRevision && (
        <EliminarRevisionDialog
          version={version}
          revisionAsesorId={revisionAsesorId}
          onCerrar={onCerrarEliminarRevision}
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
