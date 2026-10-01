import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { CrearItemRequest, ModificarItemRequest, Item } from '../models/fichas-perfil';
import { isApiErrorWithStatus } from '../../../shared/utils/api-error';
import { useTiposItem } from './useTiposItem';
import { useMiFichaPerfil } from './useMiFichaPerfil';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';

export function useItemsMiFicha() {
  const queryClient = useQueryClient();
  const { ficha } = useMiFichaPerfil();
  const { fichaPerfilId } = useFichaPerfilIdEstudiante();

  const ITEMS_KEY = ['fichas-perfil', 'estudiante', fichaPerfilId, 'items'];

  const itemsQuery = useQuery({
    queryKey: ITEMS_KEY,
    queryFn: () => fichasPerfilService.consultarItemsMiFichaPerfil(fichaPerfilId ?? ''),
    enabled: !!fichaPerfilId,
  });

  const tiposItemQuery = useTiposItem();

  const agregar = useMutation({
    mutationFn: (req: CrearItemRequest) => fichasPerfilService.agregarItemFichaPerfil(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });

  const modificar = useMutation({
    mutationFn: (req: ModificarItemRequest) => fichasPerfilService.modificarItem(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
  });

  const remover = useMutation({
    mutationFn: (itemId: string) => fichasPerfilService.removerItem(itemId),
    onSuccess: (_, itemId) => {
      queryClient.setQueryData(ITEMS_KEY, (prev: Item[] = []) =>
        prev.filter((i) => i.id !== itemId),
      );
    },
    onError: (err) => {
      if (isApiErrorWithStatus(err, 400)) {
        queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
      }
    },
  });

  return {
    fichaId: ficha?.id,
    items: itemsQuery.data ?? [],
    tiposItem: tiposItemQuery.data ?? [],
    isLoading: itemsQuery.isLoading || tiposItemQuery.isLoading,
    isError: itemsQuery.isError || tiposItemQuery.isError,
    agregar,
    modificar,
    remover,
  };
}
