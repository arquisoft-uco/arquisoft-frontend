import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import { useRespuestasRegistroModificacionUsuariosRecibidas } from '../../hooks/useRespuestasRegistroModificacionUsuariosRecibidas';
import RespuestasPanel from '../RespuestasPanel';
import RespuestasRegistroModificacionUsuariosRecibidasTable from './RespuestasRegistroModificacionUsuariosRecibidasTable';

interface Props {
  filtros: FiltrosRespuestas;
}

export default function RespuestasRegistroModificacionUsuariosRecibidasPanel({ filtros }: Props) {
  const consulta = useRespuestasRegistroModificacionUsuariosRecibidas(filtros);

  return (
    <RespuestasPanel
      consulta={consulta}
      filtros={filtros}
      Tabla={RespuestasRegistroModificacionUsuariosRecibidasTable}
    />
  );
}
