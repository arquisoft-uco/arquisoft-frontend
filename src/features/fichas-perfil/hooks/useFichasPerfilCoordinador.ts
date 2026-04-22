import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { consultarFichasPerfilCoordinador } from '../services/fichasPerfilMockService';

const PAGE_SIZE = 10;

export function useFichasPerfilCoordinador() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['fichas-perfil', 'coordinador', page],
    queryFn: () => consultarFichasPerfilCoordinador(page, PAGE_SIZE),
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
