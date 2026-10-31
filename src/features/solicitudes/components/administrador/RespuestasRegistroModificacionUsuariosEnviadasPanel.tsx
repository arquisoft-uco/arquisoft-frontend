import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasRegistroModificacionUsuariosEnviadas } from '../../hooks/useRespuestasRegistroModificacionUsuariosEnviadas';
import RespuestasPanel from '../RespuestasPanel';
import RespuestasRegistroModificacionUsuariosEnviadasTable from './RespuestasRegistroModificacionUsuariosEnviadasTable';

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasRegistroModificacionUsuariosEnviadasPanel({ filtros }: Props) {
  const consulta = useRespuestasRegistroModificacionUsuariosEnviadas(filtros);

  return (
    <RespuestasPanel
      consulta={consulta}
      filtros={filtros}
      Tabla={RespuestasRegistroModificacionUsuariosEnviadasTable}
    />
  );
}
