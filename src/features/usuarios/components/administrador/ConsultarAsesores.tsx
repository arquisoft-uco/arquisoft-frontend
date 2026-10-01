import { useAsesores } from '../../hooks/useAsesores';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarAsesores() {
  const consulta = useAsesores();

  return (
    <ConsultarUsuariosRol
      titulo="Asesores"
      idTitulo="asesores-titulo"
      etiquetaSingular="asesor"
      etiquetaPlural="asesores"
      consulta={consulta}
    />
  );
}
