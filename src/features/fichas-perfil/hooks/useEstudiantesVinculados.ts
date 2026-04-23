import { useQuery } from '@tanstack/react-query';
import { consultarEstudiantesVinculados } from '../services/fichasPerfilMockService';

export function useEstudiantesVinculados(idFichaPerfil: string | null) {
  return useQuery({
    queryKey: ['fichas-perfil', idFichaPerfil, 'estudiantes'],
    queryFn: () => consultarEstudiantesVinculados(idFichaPerfil!),
    enabled: !!idFichaPerfil,
  });
}
