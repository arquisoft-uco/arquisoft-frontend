import { useState } from 'react';
import { useGestionarRevisionEstudiante } from '../../hooks/useGestionarRevisionEstudiante';
import type { RevisionGestionable } from '../../models/RevisionGestionable';
import { puedeAvanzarObservacion } from '../../utils/avance-observacion';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';
import AccionesRevisionEstudiante from './AccionesRevisionEstudiante';
import CasillaAvanceObservacion from './CasillaAvanceObservacion';
import EncabezadoRevisionEstudiante from './EncabezadoRevisionEstudiante';
import MarcarRevisionResueltaDialog from './MarcarRevisionResueltaDialog';
import SubirVersionArtefactoPanel from './SubirVersionArtefactoPanel';

interface Props {
  revision: RevisionGestionable;
  onCerrar: () => void;
}

export default function GestionarRevisionEstudiantePanel({ revision, onCerrar }: Props) {
  const gestion = useGestionarRevisionEstudiante(revision);
  const { editable } = gestion;
  const [subiendo, setSubiendo] = useState(false);
  const [resolviendo, setResolviendo] = useState(false);

  return (
    <>
      <ObservacionesRevisionPanelBase
        titulo={editable ? 'Gestionar revisión' : 'Ver revisión'}
        descripcion={`«${revision.nombreDocumento}» · Versión ${revision.version}`}
        descripcionVacia="Tu asesor aún no ha registrado observaciones en esta revisión."
        observaciones={gestion.observaciones}
        isLoading={gestion.isLoading}
        isError={gestion.isError}
        error={gestion.error}
        onReintentar={() => void gestion.refetch()}
        onCerrar={onCerrar}
        encabezado={<EncabezadoRevisionEstudiante revision={revision} />}
        notaPie={gestion.notaPie}
        accionesPie={
          editable && (
            <AccionesRevisionEstudiante
              puedeSubir={gestion.puedeSubir}
              puedeResolver={gestion.puedeResolver}
              motivoSubida={gestion.motivoSubida}
              onSubir={() => setSubiendo(true)}
              onResolver={() => setResolviendo(true)}
            />
          )
        }
        acciones={
          editable
            ? (o) =>
                puedeAvanzarObservacion(o.estadoId) ? (
                  <CasillaAvanceObservacion observacion={o} revisionAsesorId={revision.id} />
                ) : null
            : undefined
        }
      />
      {subiendo && (
        <SubirVersionArtefactoPanel
          artefacto={{
            id: revision.artefactoId,
            nombreProyecto: revision.nombreProyecto,
            nombreDocumento: revision.nombreDocumento,
            versionDocumento: revision.versionDocumento,
          }}
          onCerrar={() => setSubiendo(false)}
        />
      )}
      {resolviendo && (
        <MarcarRevisionResueltaDialog
          revisionAsesorId={revision.id}
          nombreDocumento={revision.nombreDocumento}
          version={revision.version}
          onCerrar={() => setResolviendo(false)}
          onResuelta={onCerrar}
        />
      )}
    </>
  );
}
