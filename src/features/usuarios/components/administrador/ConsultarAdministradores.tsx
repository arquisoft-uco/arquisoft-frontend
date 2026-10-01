import { useAdministradores } from '../../hooks/useAdministradores';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarAdministradores() {
  const consulta = useAdministradores();

  return (
    <ConsultarUsuariosRol
      titulo="Administradores"
      idTitulo="administradores-titulo"
      etiquetaSingular="administrador"
      etiquetaPlural="administradores"
      consulta={consulta}
    />
  );
}
