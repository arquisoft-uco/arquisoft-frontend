import { useOpcionesEstadoRevision } from '../../hooks/useOpcionesEstadoRevision';
import { useVersionesArtefactoEstudiante } from '../../hooks/useVersionesArtefactoEstudiante';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';

const DESCRIPCION_VACIO = 'Aparecerán aquí cuando se genere una versión de uno de tus artefactos.';

export default function ConsultarVersionesArtefactoEstudiante() {
  const listado = useVersionesArtefactoEstudiante();
  const opcionesEstado = useOpcionesEstadoRevision();

  return (
    <ConsultarVersionesArtefacto
      listado={listado}
      descripcionVacio={DESCRIPCION_VACIO}
      opcionesEstado={opcionesEstado}
      mostrarAsesor
    />
  );
}
