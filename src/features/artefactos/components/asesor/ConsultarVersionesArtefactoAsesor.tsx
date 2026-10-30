import { useVersionesArtefactoAsesor } from '../../hooks/useVersionesArtefactoAsesor';
import ConsultarVersionesArtefacto from '../ConsultarVersionesArtefacto';

const DESCRIPCION_VACIO =
  'Aparecerán aquí cuando se genere una versión de un artefacto que tengas asignado.';

export default function ConsultarVersionesArtefactoAsesor() {
  const listado = useVersionesArtefactoAsesor();

  return <ConsultarVersionesArtefacto listado={listado} descripcionVacio={DESCRIPCION_VACIO} />;
}
