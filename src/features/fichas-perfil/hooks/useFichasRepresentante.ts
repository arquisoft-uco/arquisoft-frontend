import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAuthStore } from '../../../auth/authStore';

const PAGE_SIZE = 10;

export function useFichasRepresentante() {
  const [page, setPage] = useState(0);
  const representanteId = useAuthStore((s) => s.tokenParsed?.sub ?? '');

  const query = useQuery({
    queryKey: ['fichas-perfil', 'representante', representanteId, page],
    queryFn: () => fichasPerfilService.getFichasRepresentante(representanteId, page, PAGE_SIZE),
    enabled: !!representanteId,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
