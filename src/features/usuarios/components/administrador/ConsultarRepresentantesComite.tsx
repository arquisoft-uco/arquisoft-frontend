import { useRepresentantesComite } from '../../hooks/useRepresentantesComite';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarRepresentantesComite() {
  const consulta = useRepresentantesComite();

  return (
    <ConsultarUsuariosRol
      titulo="Representantes del comité"
      idTitulo="representantes-comite-titulo"
      etiquetaSingular="representante del comité"
      etiquetaPlural="representantes del comité"
      consulta={consulta}
    />
  );
}
