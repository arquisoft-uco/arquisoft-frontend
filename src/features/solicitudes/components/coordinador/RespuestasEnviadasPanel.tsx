import { useRespuestasNovedadCoordinadorEnviadas } from '../../hooks/useRespuestasNovedadCoordinadorEnviadas';
import RespuestasPanel from '../RespuestasPanel';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

interface Props {
  page: number;
  onPageChange: (page: number) => void;
}

export default function RespuestasEnviadasPanel({ page, onPageChange }: Props) {
  const consulta = useRespuestasNovedadCoordinadorEnviadas(page);

  return (
    <RespuestasPanel
      consulta={consulta}
      page={page}
      onPageChange={onPageChange}
      Tabla={RespuestasEnviadasTable}
    />
  );
}
