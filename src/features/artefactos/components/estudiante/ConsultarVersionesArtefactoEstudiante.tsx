import { useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { useVersionesArtefactoEstudiante } from '../../hooks/useVersionesArtefactoEstudiante';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { esRevisionResoluble } from '../../utils/revision-resoluble';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';
import MarcarRevisionResueltaDialog from './MarcarRevisionResueltaDialog';

const DESCRIPCION_VACIO = 'Aparecerán aquí cuando se genere una versión de uno de tus artefactos.';

export default function ConsultarVersionesArtefactoEstudiante() {
  const listado = useVersionesArtefactoEstudiante();
  const opcionesEstado = useOpcionesEstadoRevision();
  const [porResolver, setPorResolver] = useState<VersionArtefacto | null>(null);

  return (
    <>
      <ConsultarVersionesArtefacto
        listado={listado}
        descripcionVacio={DESCRIPCION_VACIO}
        opcionesEstado={opcionesEstado}
        mostrarAsesor
        accionesAdicionales={(version) =>
          esRevisionResoluble(version)
            ? [
                {
                  etiqueta: 'Marcar como resuelta',
                  icono: CircleCheck,
                  onSeleccionar: () => setPorResolver(version),
                },
              ]
            : []
        }
      />
      {porResolver && (
        <MarcarRevisionResueltaDialog version={porResolver} onCerrar={() => setPorResolver(null)} />
      )}
    </>
  );
}
