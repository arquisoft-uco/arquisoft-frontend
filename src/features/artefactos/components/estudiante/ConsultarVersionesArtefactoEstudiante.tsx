import { useState } from 'react';
import { Eye, MessageSquare, Upload } from 'lucide-react';
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
import SubirVersionArtefactoPanel from './SubirVersionArtefactoPanel';

const DESCRIPCION_VACIO = 'Aparecerán aquí cuando se genere una versión de uno de tus artefactos.';

type PanelAbierto =
  | { modo: 'revision'; artefacto: ArtefactoParaVersion; revision: RevisionGestionable }
  | { modo: 'subir'; artefacto: ArtefactoParaVersion };

function aArtefacto(version: VersionArtefacto): ArtefactoParaVersion {
  return {
    id: version.artefacto,
    nombreProyecto: version.nombreProyecto,
    nombreDocumento: version.nombreDocumento,
    versionDocumento: version.versionDocumento,
  };
}

export default function ConsultarVersionesArtefactoEstudiante() {
  const listado = useVersionesArtefactoEstudiante();
  const opcionesEstado = useOpcionesEstadoRevision();
  const [panel, setPanel] = useState<PanelAbierto | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    const revision = desVersion(version);
    if (revision === null) return [];
    const artefacto = aArtefacto(version);
    const enProgreso = revision.estadoId === ESTADO_REVISION_EN_PROGRESO;
    const acciones: AccionMenu[] = [
      {
        etiqueta: enProgreso ? 'Gestionar revisión' : 'Ver revisión',
        icono: enProgreso ? MessageSquare : Eye,
        onSeleccionar: () => setPanel({ modo: 'revision', artefacto, revision }),
      },
    ];
    if (enProgreso) {
      acciones.push({
        etiqueta: 'Subir nueva versión',
        icono: Upload,
        onSeleccionar: () => setPanel({ modo: 'subir', artefacto }),
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
        mostrarRepositorio={false}
        etiquetaFecha="Fecha de subida"
      />
      {panel?.modo === 'revision' && (
        <GestionarRevisionEstudiantePanel
          artefacto={panel.artefacto}
          revision={panel.revision}
          onCerrar={() => setPanel(null)}
        />
      )}
      {panel?.modo === 'subir' && (
        <SubirVersionArtefactoPanel artefacto={panel.artefacto} onCerrar={() => setPanel(null)} />
      )}
    </>
  );
}
