import { useQuery } from '@tanstack/react-query';
import { bibliotecaService } from '../services/bibliotecaService';

export function useAutoresDocumentacion(documentacionId: string) {
  return useQuery({
    queryKey: ['biblioteca', documentacionId, 'autores'],
    queryFn: () => bibliotecaService.consultarAutoresDocumentacion(documentacionId),
    enabled: !!documentacionId,
  });
}
