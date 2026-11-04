import { useQuery } from '@tanstack/react-query';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';

export function useVersionesRepositorioArtefacto(repositorioId: string) {
  return useQuery({
    queryKey: ['repositorio-artefactos', repositorioId, 'versiones'],
    queryFn: () => repositorioArtefactosService.consultarVersionesRepositorio(repositorioId),
    enabled: !!repositorioId,
  });
}
