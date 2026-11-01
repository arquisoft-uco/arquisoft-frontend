import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { useVersionesArtefactoEstudiante } from '../../hooks/useVersionesArtefactoEstudiante';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { estudianteVeObservaciones } from '../../utils/revision-version';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import ObservacionesRevisionEstudiantePanel from './ObservacionesRevisionEstudiantePanel';

const DESCRIPCION_VACIO = 'Aparecerán aquí cuando se genere una versión de uno de tus artefactos.';

export default function ConsultarVersionesArtefactoEstudiante() {
  const listado = useVersionesArtefactoEstudiante();
  const opcionesEstado = useOpcionesEstadoRevision();
  const [revisionAbierta, setRevisionAbierta] = useState<string | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    const revisionAsesorId = version.revisionAsesor;
    if (revisionAsesorId === null || !estudianteVeObservaciones(version)) return [];
    return [
      {
        etiqueta: 'Ver observaciones',
        icono: MessageSquare,
        onSeleccionar: () => setRevisionAbierta(revisionAsesorId),
      },
    ];
  }

  return (
    <>
      <ConsultarVersionesArtefacto
        listado={listado}
        descripcionVacio={DESCRIPCION_VACIO}
        opcionesEstado={opcionesEstado}
        accionesAdicionales={accionesAdicionales}
        mostrarAsesor
      />
      {revisionAbierta && (
        <ObservacionesRevisionEstudiantePanel
          revisionAsesorId={revisionAbierta}
          onCerrar={() => setRevisionAbierta(null)}
        />
      )}
    </>
  );
}
