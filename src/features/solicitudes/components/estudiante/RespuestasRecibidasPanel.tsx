import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasNovedadCoordinadorRecibidas } from '../../hooks/useRespuestasNovedadCoordinadorRecibidas';
import RespuestasPanel from '../RespuestasPanel';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasRecibidasPanel({ filtros }: Props) {
  const consulta = useRespuestasNovedadCoordinadorRecibidas(filtros);

  return <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={RespuestasRecibidasTable} />;
}
