import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasAmpliacionPlazoRecibidas } from '../../hooks/useRespuestasAmpliacionPlazoRecibidas';
import RespuestasPanel, { type TablaRespuestasProps } from '../RespuestasPanel';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

interface Props {
  filtros: FiltrosRespuestas;
}

function TablaAmpliacionPlazo(props: TablaRespuestasProps) {
  return <RespuestasRecibidasTable {...props} tipo="ampliacion-plazo" />;
}

export default function RespuestasAmpliacionPlazoRecibidasPanel({ filtros }: Props) {
  const consulta = useRespuestasAmpliacionPlazoRecibidas(filtros);

  return <RespuestasPanel consulta={consulta} filtros={filtros} Tabla={TablaAmpliacionPlazo} />;
}
