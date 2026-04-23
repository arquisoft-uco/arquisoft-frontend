import { useMutation, useQueryClient } from '@tanstack/react-query';
import { asignarEstudiante } from '../services/fichasPerfilMockService';
import type { AsignarEstudianteRequest } from '../models/AsignarEstudianteRequest';
import type { EstudianteVinculado } from '../models/EstudianteVinculado';

interface AsignarEstudiantePayload extends AsignarEstudianteRequest {
  nombre: string;
  email: string;
}

export function useAsignarEstudiante(idFichaPerfil: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nombre: _n, email: _e, ...req }: AsignarEstudiantePayload) =>
      asignarEstudiante(req),
    onSuccess: ({ idVinculo }, { idEstudiante, nombre, email }) => {
      queryClient.setQueryData(
        ['fichas-perfil', idFichaPerfil, 'estudiantes'],
        (prev: EstudianteVinculado[] = []) => [
          ...prev,
          { idVinculo, id: idEstudiante, nombre, email },
        ],
      );
    },
  });
}
