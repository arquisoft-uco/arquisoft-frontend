import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAvanceSubida } from '../../../shared/hooks/useAvanceSubida';
import { cargaPrefirmadaService } from '../../../shared/services/cargaPrefirmadaService';
import { artefactosService } from '../services/artefactosService';
import type { DatosSubidaVersionArtefacto } from '../models/DatosSubidaVersionArtefacto';
import type { GenerarVersionArtefactoResponse } from '../models/GenerarVersionArtefactoResponse';
import { tipoContenidoDeArtefacto } from '../utils/tipos-archivo-version-artefacto';

export function useSubirVersionArtefacto(artefactoId: string) {
  const queryClient = useQueryClient();
  const { fase, porcentaje, avanzarA, actualizarPorcentaje, reiniciar, faseDelError } =
    useAvanceSubida();

  const mutacion = useMutation<
    GenerarVersionArtefactoResponse,
    unknown,
    DatosSubidaVersionArtefacto
  >({
    mutationFn: async ({ archivo }) => {
      avanzarA('solicitando');
      const carga = await artefactosService.solicitarCargaVersionArtefacto(artefactoId, {
        nombreArchivo: archivo.name,
        tipoContenido: tipoContenidoDeArtefacto(archivo),
        tamanoBytes: archivo.size,
      });

      avanzarA('subiendo');
      await cargaPrefirmadaService.cargarArchivo(carga, archivo, actualizarPorcentaje);

      avanzarA('registrando');
      return artefactosService.generarVersionArtefacto(artefactoId, { carga: carga.carga });
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['artefactos', 'estudiante'] }),
        queryClient.invalidateQueries({
          queryKey: ['artefactos', 'versiones-artefacto', 'estudiante'],
        }),
      ]),
    onSettled: reiniciar,
  });

  return {
    mutate: mutacion.mutate,
    isPending: mutacion.isPending,
    reset: mutacion.reset,
    fase,
    porcentaje,
    faseDelError,
  };
}
