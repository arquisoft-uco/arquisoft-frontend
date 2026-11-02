import { useState } from 'react';
import { CircleCheck, MessageSquare } from 'lucide-react';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { useVersionesArtefactoEstudiante } from '../../hooks/useVersionesArtefactoEstudiante';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { esRevisionResoluble } from '../../utils/revision-resoluble';
import { estudianteVeObservaciones } from '../../utils/revision-version';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import MarcarRevisionResueltaDialog from './MarcarRevisionResueltaDialog';
import ObservacionesRevisionEstudiantePanel from './ObservacionesRevisionEstudiantePanel';

const DESCRIPCION_VACIO = 'Aparecerán aquí cuando se genere una versión de uno de tus artefactos.';

export default function ConsultarVersionesArtefactoEstudiante() {
  const listado = useVersionesArtefactoEstudiante();
  const opcionesEstado = useOpcionesEstadoRevision();
  const [revisionAbierta, setRevisionAbierta] = useState<string | null>(null);
  const [porResolver, setPorResolver] = useState<VersionArtefacto | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    const acciones: AccionMenu[] = [];
    const revisionAsesorId = version.revisionAsesor;
    if (revisionAsesorId !== null && estudianteVeObservaciones(version)) {
      acciones.push({
        etiqueta: 'Ver observaciones',
        icono: MessageSquare,
        onSeleccionar: () => setRevisionAbierta(revisionAsesorId),
      });
    }
    if (esRevisionResoluble(version)) {
      acciones.push({
        etiqueta: 'Marcar como resuelta',
        icono: CircleCheck,
        onSeleccionar: () => setPorResolver(version),
      });
    }
    return acciones;
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
      {porResolver && (
        <MarcarRevisionResueltaDialog version={porResolver} onCerrar={() => setPorResolver(null)} />
      )}
    </>
  );
}
