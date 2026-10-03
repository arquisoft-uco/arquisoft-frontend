import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { FiltrosFichasRepresentante } from '../models/FiltrosFichasRepresentante';

const PAGE_SIZE = 10;

export function useFichasRepresentante(filtros: FiltrosFichasRepresentante) {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['fichas-perfil', 'representante', filtros, page],
    queryFn: () => fichasPerfilService.getFichasRepresentante(page, PAGE_SIZE, filtros),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
