import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasNovedadAsesorRecibidas } from '../../hooks/useRespuestasNovedadAsesorRecibidas';
import RespuestasPanel, { type TablaRespuestasProps } from '../RespuestasPanel';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

interface Props {
  filtros: FiltrosRespuestas;
}

function TablaAsesor(props: TablaRespuestasProps) {
  return <RespuestasRecibidasTable {...props} tipo="asesor" />;
}

export default function RespuestasAsesorRecibidasPanel({ filtros }: Props) {
  const consulta = useRespuestasNovedadAsesorRecibidas(filtros);

  return <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={TablaAsesor} />;
}
