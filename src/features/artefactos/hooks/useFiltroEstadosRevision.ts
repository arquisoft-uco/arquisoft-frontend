import { resolverEstadosRevision, SIN_REVISION } from '../utils/filtro-estado-revision';
import { useEstadosRevisionAsesor } from './useEstadosRevisionAsesor';

export function useFiltroEstadosRevision(valoresParametro: string[]) {
  const { data: estados, isPending } = useEstadosRevisionAsesor();
  const { ids, consultas } = resolverEstadosRevision(estados, valoresParametro);
  const pideCatalogo = valoresParametro.some((valor) => {
    const recortado = valor.trim();
    return recortado !== '' && recortado !== SIN_REVISION;
  });

  return {
    ids,
    consultas,
    esperandoCatalogo: pideCatalogo && isPending,
    estados,
  };
}
