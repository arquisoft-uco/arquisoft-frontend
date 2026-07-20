import { useQuery } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useEstudiantesVinculados(idFichaPerfil: string | null) {
  return useQuery({
    queryKey: ['fichas-perfil', idFichaPerfil, 'estudiantes'],
    queryFn: () => fichasPerfilService.consultarEstudiantesVinculados(idFichaPerfil!),
    enabled: !!idFichaPerfil,
  });
}
