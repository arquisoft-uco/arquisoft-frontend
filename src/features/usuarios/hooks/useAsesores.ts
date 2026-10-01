import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usuariosService } from '../services/usuariosService';

const PAGE_SIZE = 10;

export function useAsesores() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['usuarios', 'asesores', page],
    queryFn: () => usuariosService.consultarAsesoresAdministrador(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
