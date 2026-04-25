import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  consultarItemsMiFichaPerfil,
  consultarTodosTipoItem,
  agregarItemFichaPerfil,
  modificarItem,
  removerItem,
} from '../services/fichasPerfilMockService';
import type { CrearItemRequest, ModificarItemRequest, Item } from '../models/fichas-perfil';
import { useMiFichaPerfil } from './useMiFichaPerfil';

const ITEMS_KEY = ['fichas-perfil', 'estudiante', 'items'];

export function useItemsMiFicha() {
  const queryClient = useQueryClient();
  const { ficha } = useMiFichaPerfil();

  const itemsQuery = useQuery({
    queryKey: ITEMS_KEY,
    queryFn: consultarItemsMiFichaPerfil,
  });

  const tiposItemQuery = useQuery({
    queryKey: ['fichas-perfil', 'tipos-item'],
    queryFn: consultarTodosTipoItem,
    staleTime: Infinity,
  });

  const agregar = useMutation({
    mutationFn: (req: CrearItemRequest) => agregarItemFichaPerfil(req),
    onSuccess: ({ id }, req) => {
      const tipoItem = tiposItemQuery.data?.find((t) => t.id === req.tipoItemId);
      const nuevoItem: Item = {
        id,
        tipoItem: { id: req.tipoItemId, nombre: tipoItem?.nombre ?? req.tipoItemId },
        contenido: req.contenido,
        fichaPerfilId: req.fichaPerfilId,
      };
      queryClient.setQueryData(ITEMS_KEY, (prev: Item[] = []) => [...prev, nuevoItem]);
    },
  });

  const modificar = useMutation({
    mutationFn: (req: ModificarItemRequest) => modificarItem(req),
    onSuccess: (_, req) => {
      queryClient.setQueryData(ITEMS_KEY, (prev: Item[] = []) =>
        prev.map((i) => (i.id === req.itemId ? { ...i, contenido: req.contenido } : i)),
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
