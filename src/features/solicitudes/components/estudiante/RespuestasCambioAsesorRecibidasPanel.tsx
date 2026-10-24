import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasCambioAsesorRecibidas } from '../../hooks/useRespuestasCambioAsesorRecibidas';
import RespuestasPanel, { type TablaRespuestasProps } from '../RespuestasPanel';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

interface Props {
  filtros: FiltrosRespuestas;
}

function TablaCambioAsesor(props: TablaRespuestasProps) {
  return <RespuestasRecibidasTable {...props} tipo="cambio-asesor" />;
}

export default function RespuestasCambioAsesorRecibidasPanel({ filtros }: Props) {
  const consulta = useRespuestasCambioAsesorRecibidas(filtros);

  return <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={TablaCambioAsesor} />;
}
