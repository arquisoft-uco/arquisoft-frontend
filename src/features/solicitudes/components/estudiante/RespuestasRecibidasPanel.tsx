import { useRespuestasNovedadCoordinadorRecibidas } from '../../hooks/useRespuestasNovedadCoordinadorRecibidas';
import RespuestasPanel from '../RespuestasPanel';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function RespuestasRecibidasPanel({ page, onPageChange }: Props) {
  const consulta = useRespuestasNovedadCoordinadorRecibidas(page);

  return (
    <RespuestasPanel
      consulta={consulta}
      page={page}
      onPageChange={onPageChange}
      Tabla={RespuestasRecibidasTable}
    />
  );
}
