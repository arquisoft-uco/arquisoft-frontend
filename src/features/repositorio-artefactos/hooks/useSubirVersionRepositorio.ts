import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { repositorioArtefactosService } from '../services/repositorioArtefactosService';
import type { DatosSubidaVersion, FaseSubidaVersion } from '../models/DatosSubidaVersion';
import type { SubirVersionResponse } from '../models/SubirVersionResponse';
import { esErrorDeDocumento } from '../utils/errores-version';
import { tipoContenidoDe } from '../utils/tipos-archivo-version';

export function useSubirVersionRepositorio(repositorioId: string) {
  const queryClient = useQueryClient();
  const [fase, setFase] = useState<FaseSubidaVersion | null>(null);
  const [porcentaje, setPorcentaje] = useState(0);
  const ultimaFase = useRef<FaseSubidaVersion | null>(null);

  const invalidarVersiones = () =>
    queryClient.invalidateQueries({
      queryKey: ['repositorio-artefactos', repositorioId, 'versiones'],
    });

  function avanzarA(nueva: FaseSubidaVersion) {
    ultimaFase.current = nueva;
    setFase(nueva);
  }

  const mutacion = useMutation<SubirVersionResponse, unknown, DatosSubidaVersion>({
    mutationFn: async ({ archivo, nombreDocumento, nuevoDocumento }) => {
      avanzarA('solicitando');
      const carga = await repositorioArtefactosService.solicitarCargaVersion(repositorioId, {
        nombreArchivo: archivo.name,
        tipoContenido: tipoContenidoDe(archivo),
        tamanoBytes: archivo.size,
      });

      avanzarA('subiendo');
      setPorcentaje(0);
      await repositorioArtefactosService.cargarArchivoVersion(carga, archivo, setPorcentaje);

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
    onSettled: () => {
      setFase(null);
      setPorcentaje(0);
    },
  });

  return {
    mutate: mutacion.mutate,
    isPending: mutacion.isPending,
    reset: mutacion.reset,
    fase,
    porcentaje,
    faseDelError: () => ultimaFase.current,
  };
}
