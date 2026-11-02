import { useState } from 'react';
import { Eye, MessageSquare } from 'lucide-react';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { useVersionesArtefactoEstudiante } from '../../hooks/useVersionesArtefactoEstudiante';
import type { ArtefactoParaVersion } from '../../models/ArtefactoParaVersion';
import type { RevisionGestionable } from '../../models/RevisionGestionable';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { desVersion } from '../../utils/revision-gestionable';
import { ESTADO_REVISION_EN_PROGRESO } from '../../utils/revision-resoluble';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import GestionarRevisionEstudiantePanel from './GestionarRevisionEstudiantePanel';

const DESCRIPCION_VACIO = 'Aparecerán aquí cuando se genere una versión de uno de tus artefactos.';

export default function ConsultarVersionesArtefactoEstudiante() {
  const listado = useVersionesArtefactoEstudiante();
  const opcionesEstado = useOpcionesEstadoRevision();
  const [abierta, setAbierta] = useState<{
    artefacto: ArtefactoParaVersion;
    revision: RevisionGestionable;
  } | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    const revision = desVersion(version);
    if (revision === null) return [];
    const enProgreso = revision.estadoId === ESTADO_REVISION_EN_PROGRESO;
    return [
      {
        etiqueta: enProgreso ? 'Gestionar revisión' : 'Ver revisión',
        icono: enProgreso ? MessageSquare : Eye,
        onSeleccionar: () =>
          setAbierta({
            artefacto: {
              id: version.artefacto,
              nombreProyecto: version.nombreProyecto,
              nombreDocumento: version.nombreDocumento,
              versionDocumento: version.versionDocumento,
            },
            revision,
          }),
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
        mostrarRepositorio={false}
        etiquetaFecha="Fecha de subida"
      />
      {abierta && (
        <GestionarRevisionEstudiantePanel
          artefacto={abierta.artefacto}
          revision={abierta.revision}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </>
  );
}
