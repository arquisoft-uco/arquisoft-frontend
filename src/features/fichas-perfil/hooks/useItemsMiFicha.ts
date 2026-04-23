import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  consultarItemsMiFichaPerfil,
  consultarTodosTipoItem,
  agregarItemFichaPerfil,
  modificarItem,
  removerItem,
} from '../services/fichasPerfilMockService';
import type { CrearItemRequest, ModificarItemRequest, Item } from '../models/fichas-perfil';

export function useItemsMiFicha() {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'items'],
    queryFn: consultarItemsMiFichaPerfil,
  });

  const tiposItemQuery = useQuery({
    queryKey: ['fichas-perfil', 'tipos-item'],
    queryFn: consultarTodosTipoItem,
    staleTime: Infinity,
  });

  const ITEMS_KEY = ['fichas-perfil', 'estudiante', 'items'];

  const agregar = useMutation({
    mutationFn: (req: CrearItemRequest) => agregarItemFichaPerfil(req),
    onSuccess: (nuevoItem) => {
      queryClient.setQueryData(ITEMS_KEY, (prev: Item[] = []) => [...prev, nuevoItem]);
    },
  });

  const modificar = useMutation({
    mutationFn: ({ itemId, req }: { itemId: string; req: ModificarItemRequest }) =>
      modificarItem(itemId, req),
    onSuccess: (itemActualizado) => {
      queryClient.setQueryData(ITEMS_KEY, (prev: Item[] = []) =>
        prev.map((i) => (i.id === itemActualizado.id ? itemActualizado : i)),
      );
    },
  });

  const remover = useMutation({
    mutationFn: (itemId: string) => removerItem(itemId),
    onSuccess: (_, itemId) => {
      queryClient.setQueryData(ITEMS_KEY, (prev: Item[] = []) =>
        prev.filter((i) => i.id !== itemId),
      );
    },
  });

  return {
    items: itemsQuery.data ?? [],
    tiposItem: tiposItemQuery.data ?? [],
    isLoading: itemsQuery.isLoading || tiposItemQuery.isLoading,
    isError: itemsQuery.isError || tiposItemQuery.isError,
    agregar,
    modificar,
    remover,
  };
}
