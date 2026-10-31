import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';

const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se genere una versión de un artefacto que tengas asignado.';

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();
  const opcionesEstado = useOpcionesEstadoRevision();

  return (
    <ConsultarVersionesArtefacto
      listado={listado}
      descripcionVacio={DESCRIPCION_VACIO}
      opcionesEstado={opcionesEstado}
    />
  );
}
