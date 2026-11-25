import { resolverEstadoRevision, SIN_REVISION } from '../utils/filtro-estado-revision';
import { useEstadosRevisionAsesor } from './useEstadosRevisionAsesor';

export function useFiltroEstadoRevision(valorParametro: string) {
  const { data: estados, isPending } = useEstadosRevisionAsesor();
  const esSinRevision = valorParametro === SIN_REVISION;
  const resuelto = esSinRevision ? undefined : resolverEstadoRevision(estados, valorParametro);

  return {
    valor: esSinRevision ? SIN_REVISION : (resuelto?.id ?? ''),
    consulta: esSinRevision ? SIN_REVISION : (resuelto?.nombre ?? ''),
    esperandoCatalogo: valorParametro !== '' && !esSinRevision && isPending,
    estados,
  };
}
