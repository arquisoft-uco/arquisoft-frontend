import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useCompanerosFichaPerfil(idFichaPerfil: string | null) {
  return useQuery({
    queryKey: ['fichas-perfil', idFichaPerfil, 'companeros'],
    queryFn: () => fichasPerfilService.consultarCompanerosFichaPerfil(idFichaPerfil!),
    enabled: !!idFichaPerfil,
  });
}
