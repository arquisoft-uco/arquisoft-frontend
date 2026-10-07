import { useMutation } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';

export function useAgregarObservacionEvaluacion() {
  return useMutation({
    mutationFn: fichasPerfilService.agregarObservacionEvaluacion,
  });
}
