import { useState } from 'react';
import { MessageSquarePlus } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import { useRevisionEnGestion } from '../../hooks/useRevisionEnGestion';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { ESTADO_OBSERVACION_SOLUCIONADA } from '../../utils/decision-observacion';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';
import AccionesObservacionMenu from './AccionesObservacionMenu';
import AccionesRevision from './AccionesRevision';
import AgregarObservacionPanel from './AgregarObservacionPanel';
import DialogosGestionRevision, { type Decision } from './DialogosGestionRevision';
import EncabezadoRevision from './EncabezadoRevision';
import ObservacionesRevisionAnteriorSeccion from './ObservacionesRevisionAnteriorSeccion';

interface Props {
  revisionAsesorId: string;
  version: VersionArtefacto;
  onCerrar: () => void;
}

export default function GestionarRevisionPanel({ revisionAsesorId, version, onCerrar }: Props) {
  const revision = useRevisionEnGestion({ revisionAsesorId, version });
  const { editable, puedeDecidir, situacion } = revision;
  const [agregando, setAgregando] = useState(false);
  const [aEliminar, setAEliminar] = useState<ObservacionRevision | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [cerrando, setCerrando] = useState(false);
  const [decision, setDecision] = useState<Decision | null>(null);

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

  function accionesDe(observacion: ObservacionRevision) {
    if (!editable && !(puedeDecidir && observacion.estadoId === ESTADO_OBSERVACION_SOLUCIONADA)) {
      return undefined;
    }
    return (
      <AccionesObservacionMenu
        observacion={observacion}
        modo={editable ? 'eliminar' : 'decidir'}
        puedeReabrir={situacion === 'disponible'}
        onEliminar={setAEliminar}
        onDecidir={(o, estado) => setDecision({ observacion: o, estado, version })}
      />
    );
  }

  return (
    <>
      <ObservacionesRevisionPanelBase
        titulo="Gestionar revisión"
        descripcion={`«${version.nombreDocumento}» · Versión ${version.version}`}
        descripcionVacia={
          editable
            ? 'Agrega la primera observación de esta revisión.'
            : 'Aún no hay observaciones registradas en esta revisión.'
        }
        observaciones={revision.observaciones}
        isLoading={revision.isLoading}
        isError={revision.isError}
        error={revision.error}
        onReintentar={() => void revision.refetch()}
        onCerrar={onCerrar}
        encabezado={<EncabezadoRevision version={version} aviso={revision.textoAviso} />}
        barra={
          editable && (
            <div className="actions-row">
              <Button
                variante="secundario"
                icono={MessageSquarePlus}
                onClick={() => setAgregando(true)}
              >
                Agregar observación
              </Button>
            </div>
          )
        }
        notaPie={revision.notaPie}
        accionesPie={
          editable && (
            <AccionesRevision
              habilitado={revision.hayObservaciones}
              mostrarNota={revision.mostrarNotaEnvio}
              puedeCerrar={revision.cierre.puedeCerrar}
              hayNotaCierre={!!revision.cierre.motivo}
              onEnviar={() => setEnviando(true)}
              onCerrarRevision={() => setCerrando(true)}
            />
          )
        }
        acciones={accionesDe}
        seccionAnterior={
          <ObservacionesRevisionAnteriorSeccion
            anterior={revision.anterior}
            onDecidir={(v, observacion, estado) => setDecision({ observacion, estado, version: v })}
          />
        }
      />
      <DialogosGestionRevision
        version={version}
        revisionAsesorId={revisionAsesorId}
        aEliminar={aEliminar}
        decision={decision}
        enviando={enviando}
        cerrando={cerrando}
        onCerrarEliminar={() => setAEliminar(null)}
        onCerrarDecision={() => setDecision(null)}
        onCerrarEnvio={() => setEnviando(false)}
        onCerrarCierre={() => setCerrando(false)}
        onSalir={onCerrar}
      />
    </>
  );
}
