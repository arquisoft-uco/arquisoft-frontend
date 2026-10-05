import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useParametrosListado } from './useParametrosListado';

const PAGE_SIZE = 10;

export function useFichasAsesor() {
  const { pagina: page, irAPagina } = useParametrosListado();

  const query = useQuery({
    queryKey: ['fichas-perfil', 'asesor', page],
    queryFn: () => fichasPerfilService.getFichasAsesor(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: irAPagina,
  };
}
