import { useSolicitudesRegistroModificacionUsuariosRecibidas } from '../../hooks/useSolicitudesRegistroModificacionUsuariosRecibidas';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesRegistroModificacionUsuariosRecibidasPanel({
  page,
  onPageChange,
}: Props) {
  const consulta = useSolicitudesRegistroModificacionUsuariosRecibidas(page);

  return (
    <ListadoSolicitudesRecibidas
      consulta={{ ...consulta, page, goToPage: onPageChange }}
      receptor="administrador"
      tipo="registro-modificacion-usuarios"
    />
  );
}
