import { useState } from 'react';
import { ClipboardPlus, MessageSquare, Send } from 'lucide-react';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { usePuedeGestionarObservaciones } from '../../hooks/usePuedeGestionarObservaciones';
import { usePuedeRegistrarRevision } from '../../hooks/usePuedeRegistrarRevision';
import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import EnviarRevisionDialog from './EnviarRevisionDialog';
import ObservacionesRevisionPanel from './ObservacionesRevisionPanel';
import RegistrarRevisionDialog from './RegistrarRevisionDialog';

const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se genere una versión de un artefacto que tengas asignado.';

interface ObservacionesAbiertas {
  version: VersionArtefacto;
  revisionAsesorId: string;
}

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();
  const opcionesEstado = useOpcionesEstadoRevision();
  const { puedeRegistrar } = usePuedeRegistrarRevision(listado.data?.content ?? []);
  const { puedeGestionar } = usePuedeGestionarObservaciones();
  const [versionARegistrar, setVersionARegistrar] = useState<VersionArtefacto | null>(null);
  const [versionAEnviar, setVersionAEnviar] = useState<ObservacionesAbiertas | null>(null);
  const [observaciones, setObservaciones] = useState<ObservacionesAbiertas | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    const acciones: AccionMenu[] = [];
    if (puedeRegistrar(version)) {
      acciones.push({
        etiqueta: 'Registrar revisión',
        icono: ClipboardPlus,
        onSeleccionar: () => setVersionARegistrar(version),
      });
    }
    const revisionAsesorId = version.revisionAsesor;
    if (revisionAsesorId !== null && puedeGestionar(version)) {
      acciones.push({
        etiqueta: 'Enviar revisión',
        icono: Send,
        onSeleccionar: () => setVersionAEnviar({ version, revisionAsesorId }),
      });
    }
    if (revisionAsesorId !== null) {
      acciones.push({
        etiqueta: puedeGestionar(version) ? 'Gestionar observaciones' : 'Ver observaciones',
        icono: MessageSquare,
        onSeleccionar: () => setObservaciones({ version, revisionAsesorId }),
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
      {versionAEnviar && (
        <EnviarRevisionDialog
          version={versionAEnviar.version}
          revisionAsesorId={versionAEnviar.revisionAsesorId}
          onCerrar={() => setVersionAEnviar(null)}
        />
      )}
      {observaciones && (
        <ObservacionesRevisionPanel
          revisionAsesorId={observaciones.revisionAsesorId}
          version={observaciones.version}
          editable={puedeGestionar(observaciones.version)}
          onCerrar={() => setObservaciones(null)}
        />
      )}
    </>
  );
}
