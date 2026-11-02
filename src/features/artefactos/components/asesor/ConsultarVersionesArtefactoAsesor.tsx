import { useState } from 'react';
import { ClipboardList, ClipboardPlus, RotateCcw } from 'lucide-react';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { usePuedeRegistrarRevision } from '../../hooks/usePuedeRegistrarRevision';
import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { reabreArtefacto } from '../../utils/revision-version';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import GestionarRevisionPanel from './GestionarRevisionPanel';
import RegistrarRevisionDialog from './RegistrarRevisionDialog';

const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se genere una versión de un artefacto que tengas asignado.';

interface RevisionAbierta {
  version: VersionArtefacto;
  revisionAsesorId: string;
}

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();
  const opcionesEstado = useOpcionesEstadoRevision();
  const { puedeRegistrar } = usePuedeRegistrarRevision(listado.data?.content ?? []);
  const [versionARegistrar, setVersionARegistrar] = useState<VersionArtefacto | null>(null);
  const [revisionAbierta, setRevisionAbierta] = useState<RevisionAbierta | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    const acciones: AccionMenu[] = [];
    if (puedeRegistrar(version)) {
      const reabre = reabreArtefacto(version);
      acciones.push({
        etiqueta: reabre ? 'Reabrir revisión' : 'Registrar revisión',
        icono: reabre ? RotateCcw : ClipboardPlus,
        onSeleccionar: () => setVersionARegistrar(version),
      });
    }
    const revisionAsesorId = version.revisionAsesor;
    if (revisionAsesorId !== null) {
      acciones.push({
        etiqueta: 'Gestionar revisión',
        icono: ClipboardList,
        onSeleccionar: () => setRevisionAbierta({ version, revisionAsesorId }),
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
      />
      {versionARegistrar && (
        <RegistrarRevisionDialog
          version={versionARegistrar}
          onCerrar={() => setVersionARegistrar(null)}
        />
      )}
      {revisionAbierta && (
        <GestionarRevisionPanel
          revisionAsesorId={revisionAbierta.revisionAsesorId}
          version={revisionAbierta.version}
          onCerrar={() => setRevisionAbierta(null)}
        />
      )}
    </>
  );
}
