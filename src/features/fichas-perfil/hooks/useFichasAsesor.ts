import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useAuthStore } from '../../../auth/authStore';

const PAGE_SIZE = 10;

export function useFichasAsesor() {
  const [page, setPage] = useState(0);
  const asesorId = useAuthStore((s) => s.tokenParsed?.sub ?? '');

  const query = useQuery({
    queryKey: ['fichas-perfil', 'asesor', asesorId, page],
    queryFn: () => fichasPerfilService.getFichasAsesor(asesorId, page, PAGE_SIZE),
    enabled: !!asesorId,
  });

  return {
    ...query,
    page,
    pageSize: PAGE_SIZE,
    goToPage: setPage,
  };
}
