import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasNovedadAsesorEnviadas } from '../../hooks/useRespuestasNovedadAsesorEnviadas';
import RespuestasPanel from '../RespuestasPanel';
import RespuestasEnviadasAsesorTable from './RespuestasEnviadasAsesorTable';

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasEnviadasAsesorPanel({ filtros }: Props) {
  const consulta = useRespuestasNovedadAsesorEnviadas(filtros);

  return (
    <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={RespuestasEnviadasAsesorTable} />
  );
}
