import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasCambioAsesorEnviadas } from '../../hooks/useRespuestasCambioAsesorEnviadas';
import RespuestasPanel, { type TablaRespuestasProps } from '../RespuestasPanel';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

function TablaCambioAsesor(props: TablaRespuestasProps) {
  return <RespuestasEnviadasTable {...props} tipo="cambio-asesor" />;
}

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasCambioAsesorEnviadasPanel({ filtros }: Props) {
  const consulta = useRespuestasCambioAsesorEnviadas(filtros);

  return <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={TablaCambioAsesor} />;
}
