import { useArtefactosAsesor } from '../../hooks/useArtefactosAsesor';
import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';

const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se genere una versión de un artefacto que tengas asignado.';

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();
  const catalogo = useArtefactosAsesor();

  return (
    <ConsultarVersionesArtefacto
      listado={listado}
      catalogo={catalogo}
      descripcionVacio={DESCRIPCION_VACIO}
    />
  );
}
