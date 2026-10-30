import { useCatalogoArtefactosEstudiante } from '../../hooks/useCatalogoArtefactosEstudiante';
import { useVersionesArtefactoEstudiante } from '../../hooks/useVersionesArtefactoEstudiante';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';

const DESCRIPCION_VACIO = 'Aparecerán aquí cuando se genere una versión de uno de tus artefactos.';

export default function ConsultarVersionesArtefactoEstudiante() {
  const listado = useVersionesArtefactoEstudiante();
  const catalogo = useCatalogoArtefactosEstudiante();

  return (
    <ConsultarVersionesArtefacto
      listado={listado}
      catalogo={catalogo}
      descripcionVacio={DESCRIPCION_VACIO}
    />
  );
}
