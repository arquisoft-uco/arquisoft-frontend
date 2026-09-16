import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

const PAGE_SIZE = 10;

export function useFichasAsesor() {
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['fichas-perfil', 'asesor', page],
    queryFn: () => fichasPerfilService.getFichasAsesor(page, PAGE_SIZE),
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
