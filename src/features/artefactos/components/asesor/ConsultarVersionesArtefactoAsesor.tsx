import { useState } from 'react';
import { ClipboardPlus } from 'lucide-react';
import type { AccionMenu } from '../../../../shared/components/ui/RowMenu';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { usePuedeRegistrarRevision } from '../../hooks/usePuedeRegistrarRevision';
import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import RegistrarRevisionDialog from './RegistrarRevisionDialog';

const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se genere una versión de un artefacto que tengas asignado.';

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();
  const opcionesEstado = useOpcionesEstadoRevision();
  const { puedeRegistrar } = usePuedeRegistrarRevision(listado.data?.content ?? []);
  const [versionARegistrar, setVersionARegistrar] = useState<VersionArtefacto | null>(null);

  function accionesAdicionales(version: VersionArtefacto): AccionMenu[] {
    if (!puedeRegistrar(version)) return [];
    return [
      {
        etiqueta: 'Registrar revisión',
        icono: ClipboardPlus,
        onSeleccionar: () => setVersionARegistrar(version),
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
      />
      {versionARegistrar && (
        <RegistrarRevisionDialog
          version={versionARegistrar}
          onCerrar={() => setVersionARegistrar(null)}
        />
      )}
    </>
  );
}
