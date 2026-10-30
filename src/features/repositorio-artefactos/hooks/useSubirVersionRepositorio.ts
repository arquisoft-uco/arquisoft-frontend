import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAvanceSubida } from '../../../shared/hooks/useAvanceSubida';
import { cargaPrefirmadaService } from '../../../shared/services/cargaPrefirmadaService';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import type { DatosSubidaVersion } from '../models/DatosSubidaVersion';
import type { SubirVersionResponse } from '../models/SubirVersionResponse';
import { esErrorDeDocumento } from '../utils/errores-version';
import { tipoContenidoDe } from '../utils/tipos-archivo-version';

export function useSubirVersionRepositorio(repositorioId: string) {
  const queryClient = useQueryClient();
  const { fase, porcentaje, avanzarA, actualizarPorcentaje, reiniciar, faseDelError } =
    useAvanceSubida();

  const invalidarVersiones = () =>
    queryClient.invalidateQueries({
      queryKey: ['repositorio-artefactos', repositorioId, 'versiones'],
    });

  const mutacion = useMutation<SubirVersionResponse, unknown, DatosSubidaVersion>({
    mutationFn: async ({ archivo, nombreDocumento, nuevoDocumento }) => {
      avanzarA('solicitando');
      const carga = await repositorioArtefactosService.solicitarCargaVersion(repositorioId, {
        nombreArchivo: archivo.name,
        tipoContenido: tipoContenidoDe(archivo),
        tamanoBytes: archivo.size,
      });

      avanzarA('subiendo');
      await cargaPrefirmadaService.cargarArchivo(carga, archivo, actualizarPorcentaje);

      avanzarA('registrando');
      return repositorioArtefactosService.subirVersion(repositorioId, {
        carga: carga.carga,
        nombreDocumento,
        nuevoDocumento,
      });
    },
    onSuccess: invalidarVersiones,
    onError: (err) => {
      if (esErrorDeDocumento(err)) invalidarVersiones();
    },
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
