import { useSolicitudesCambioAsesorRecibidas } from '../../hooks/useSolicitudesCambioAsesorRecibidas';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesCambioAsesorRecibidasPanel({ page, onPageChange }: Props) {
  const consulta = useSolicitudesCambioAsesorRecibidas(page);

  return (
    <ListadoSolicitudesRecibidas
      consulta={{ ...consulta, page, goToPage: onPageChange }}
      receptor="coordinador"
      tipo="cambio-asesor"
    />
  );
}
