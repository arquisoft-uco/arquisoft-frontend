import { useFiltroEstadosRevision } from './useFiltroEstadosRevision';

export function useFiltroEstadoRevision(valorParametro: string) {
  const filtro = useFiltroEstadosRevision(valorParametro ? [valorParametro] : []);

  return {
    valor: filtro.ids[0] ?? '',
    consulta: filtro.consultas[0] ?? '',
    esperandoCatalogo: filtro.esperandoCatalogo,
    estados: filtro.estados,
  };
}
