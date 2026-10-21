import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasNovedadCoordinadorRecibidas } from '../../hooks/useRespuestasNovedadCoordinadorRecibidas';
import RespuestasPanel, { type TablaRespuestasProps } from '../RespuestasPanel';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

interface Props {
  filtros: FiltrosRespuestas;
}

function TablaCoordinador(props: TablaRespuestasProps) {
  return <RespuestasRecibidasTable {...props} tipo="coordinador" />;
}

export default function RespuestasRecibidasPanel({ filtros }: Props) {
  const consulta = useRespuestasNovedadCoordinadorRecibidas(filtros);

  return <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={TablaCoordinador} />;
}
