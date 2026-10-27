import { useSolicitudesAmpliacionPlazoRecibidas } from '../../hooks/useSolicitudesAmpliacionPlazoRecibidas';
import ListadoSolicitudesRecibidas from '../ListadoSolicitudesRecibidas';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function SolicitudesAmpliacionPlazoRecibidasPanel({ page, onPageChange }: Props) {
  const consulta = useSolicitudesAmpliacionPlazoRecibidas(page);

  return (
    <ListadoSolicitudesRecibidas
      consulta={{ ...consulta, page, goToPage: onPageChange }}
      receptor="coordinador"
      tipo="ampliacion-plazo"
    />
  );
}
