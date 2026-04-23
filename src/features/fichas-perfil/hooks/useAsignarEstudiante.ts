import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asignarEstudiante } from '../services/fichasPerfilMockService';
import type { AsignarEstudianteRequest } from '../models/AsignarEstudianteRequest';

export function useAsignarEstudiante(idFichaPerfil: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: AsignarEstudianteRequest) => asignarEstudiante(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', idFichaPerfil, 'estudiantes'] });
    },
  });
}
