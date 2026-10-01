import { useAsesoresFicha } from '../../hooks/useAsesoresFicha';
import ConsultarUsuariosRol from './ConsultarUsuariosRol';

export default function ConsultarAsesoresFicha() {
  const consulta = useAsesoresFicha();

  return (
    <ConsultarUsuariosRol
      titulo="Asesores de ficha"
      idTitulo="asesores-ficha-titulo"
      etiquetaSingular="asesor de ficha"
      etiquetaPlural="asesores de ficha"
      consulta={consulta}
    />
  );
}
