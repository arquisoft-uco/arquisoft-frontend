import { useGestionarRevisionEstudiante } from '../../hooks/useGestionarRevisionEstudiante';
import type { RevisionGestionable } from '../../models/RevisionGestionable';
import { puedeAvanzarObservacion } from '../../utils/avance-observacion';
import ObservacionesRevisionPanelBase from '../ObservacionesRevisionPanelBase';
import AccionesRevisionEstudiante from './AccionesRevisionEstudiante';
import CasillaAvanceObservacion from './CasillaAvanceObservacion';
import EncabezadoRevisionEstudiante from './EncabezadoRevisionEstudiante';

interface Props {
  revision: RevisionGestionable;
  onSubir: () => void;
  onResolver: () => void;
  onCerrar: () => void;
}

export default function DetalleRevisionEstudianteContenido({
  revision,
  onSubir,
  onResolver,
  onCerrar,
}: Props) {
  const gestion = useGestionarRevisionEstudiante(revision);
  const { editable } = gestion;

  return (
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
            onSubir={onSubir}
            onResolver={onResolver}
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
  );
}
