import { useState } from 'react';
import { ClipboardList, ClipboardPlus, RotateCcw } from 'lucide-react';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { usePuedeRegistrarRevision } from '../../hooks/usePuedeRegistrarRevision';
import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { gestionarRevision, type AccionRevisionAsesor } from '../../utils/accion-revision-asesor';
import { estaCerrado } from '../../utils/estado-proyecto';
import { reabreArtefacto } from '../../utils/revision-version';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import RevisionAsesorDialogo from './RevisionAsesorDialogo';

const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se genere una versión de un artefacto que tengas asignado.';

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();
  const opcionesEstado = useOpcionesEstadoRevision();
  const { puedeRegistrar } = usePuedeRegistrarRevision(listado.data?.content ?? []);
  const [revision, setRevision] = useState<AccionRevisionAsesor | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    const acciones: AccionMenu[] = [];
    if (puedeRegistrar(version) && !estaCerrado(version)) {
      const reabre = reabreArtefacto(version);
      acciones.push({
        etiqueta: reabre ? 'Reabrir revisión' : 'Registrar revisión',
        icono: reabre ? RotateCcw : ClipboardPlus,
        onSeleccionar: () => setRevision({ tipo: 'registrar', version }),
      });
    }
    const gestion = gestionarRevision(version);
    if (gestion) {
      acciones.push({
        etiqueta: 'Gestionar revisión',
        icono: ClipboardList,
        onSeleccionar: () => setRevision(gestion),
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
      {revision && <RevisionAsesorDialogo accion={revision} onCambiar={setRevision} />}
    </>
  );
}
