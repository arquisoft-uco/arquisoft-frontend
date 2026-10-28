import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasAmpliacionPlazoEnviadas } from '../../hooks/useRespuestasAmpliacionPlazoEnviadas';
import RespuestasPanel, { type TablaRespuestasProps } from '../RespuestasPanel';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

function TablaAmpliacionPlazo(props: TablaRespuestasProps) {
  return <RespuestasEnviadasTable {...props} tipo="ampliacion-plazo" />;
}

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasAmpliacionPlazoEnviadasPanel({ filtros }: Props) {
  const consulta = useRespuestasAmpliacionPlazoEnviadas(filtros);

  return <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={TablaAmpliacionPlazo} />;
}
