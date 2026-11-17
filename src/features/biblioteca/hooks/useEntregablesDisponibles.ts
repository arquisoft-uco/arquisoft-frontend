import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useParametrosListado } from '../../../shared/hooks/useParametrosListado';
import { bibliotecaService } from '../services/bibliotecaService';

const PAGE_SIZE = 10;

export function useEntregablesDisponibles() {
  const parametros = useParametrosListado();
  const page = parametros.pagina;
  const texto = parametros.texto('q');

  function setTexto(valor: string) {
    parametros.cambiar({ q: valor });
  }

  function limpiarFiltros() {
    parametros.cambiar({ q: undefined });
  }

  const query = useQuery({
    queryKey: ['biblioteca', 'entregables-disponibles', page, texto.trim()],
    queryFn: () =>
      bibliotecaService.consultarEntregablesDisponibles({
        pagina: page,
        tamanio: PAGE_SIZE,
        titulo: texto.trim() || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: parametros.irAPagina,
    texto,
    setTexto,
    limpiarFiltros,
  };
}
