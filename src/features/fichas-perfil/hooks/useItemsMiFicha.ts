import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  consultarItemsMiFichaPerfil,
  consultarTodosTipoItem,
  agregarItemFichaPerfil,
  modificarItem,
  removerItem,
} from '../services/fichasPerfilMockService';
import type { CrearItemRequest, ModificarItemRequest } from '../models/fichas-perfil';

export function useItemsMiFicha() {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'items'],
    queryFn: consultarItemsMiFichaPerfil,
  });

  const tiposItemQuery = useQuery({
    queryKey: ['fichas-perfil', 'tipos-item'],
    queryFn: consultarTodosTipoItem,
  });

  const agregar = useMutation({
    mutationFn: (req: CrearItemRequest) => agregarItemFichaPerfil(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', 'estudiante', 'items'] });
    },
  });

  const modificar = useMutation({
    mutationFn: ({ itemId, req }: { itemId: string; req: ModificarItemRequest }) =>
      modificarItem(itemId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', 'estudiante', 'items'] });
    },
  });

  const remover = useMutation({
    mutationFn: (itemId: string) => removerItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-perfil', 'estudiante', 'items'] });
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
