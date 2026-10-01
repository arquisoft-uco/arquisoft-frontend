import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { MiFichaPerfilResponse } from '../models/MiFichaPerfilResponse';
import { toast } from '../../../shared/hooks/useToast';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { FICHAS_ESTUDIANTE_QUERY_KEY } from './useFichasPerfilEstudiante';

export function useMiFichaPerfil() {
  const queryClient = useQueryClient();
  const { ficha, fichas, seleccionarFicha, isLoading, isError } = useFichaPerfilIdEstudiante();

  const modificarTitulo = useMutation({
    mutationFn: (tituloProyecto: string) => {
      if (!ficha?.id) return Promise.reject(new Error('No hay ficha de perfil seleccionada.'));
      return fichasPerfilService.modificarTituloFichaPerfil({ fichaPerfilId: ficha.id, tituloProyecto });
    },
    onSuccess: (_, tituloProyecto) => {
      const id = ficha?.id;
      queryClient.setQueryData<MiFichaPerfilResponse[]>(FICHAS_ESTUDIANTE_QUERY_KEY, (lista) =>
        lista?.map((f) => (f.id === id ? { ...f, tituloProyecto } : f)),
      );
      ['coordinador', 'asesor', 'representante'].forEach((rol) =>
        queryClient.invalidateQueries({ queryKey: ['fichas-perfil', rol] }),
      );
      toast.success('Ficha actualizada', 'El título del proyecto se guardó correctamente.');
    },
    onError: (err) => toast.error('Error al modificar', getApiErrorMessage(err, 'No se pudo actualizar el título de la ficha.')),
  });

  return {
    ficha: ficha ?? undefined,
    fichas,
    isLoadingFicha: isLoading,
    isErrorFicha: isError,
    errorFicha: isError,
    sinFicha: !isLoading && !isError && fichas.length === 0,
    seleccionarFicha,
    companeros: ficha?.integrantes ?? [],
    modificarTitulo,
  };
}
