import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  consultarEstadoFichaPerfilEstudiante,
  consultarTodosEstadosFicha,
  agregarEstadoFichaPerfilEstudiante,
} from '../services/fichasPerfilMockService';
import type { AgregarEstadoFichaPerfilRequest, EstadoFichaPerfil } from '../models/fichas-perfil';

export function useEstadosMiFicha() {
  const queryClient = useQueryClient();

  const estadosQuery = useQuery({
    queryKey: ['fichas-perfil', 'estudiante', 'estados'],
    queryFn: consultarEstadoFichaPerfilEstudiante,
  });

  const catalogoEstadosQuery = useQuery({
    queryKey: ['fichas-perfil', 'catalogo-estados-ficha'],
    queryFn: consultarTodosEstadosFicha,
  });

  const agregar = useMutation({
    mutationFn: (req: AgregarEstadoFichaPerfilRequest) => agregarEstadoFichaPerfilEstudiante(req),
    onSuccess: (nuevoEstado) => {
      queryClient.setQueryData(
        ['fichas-perfil', 'estudiante', 'estados'],
        (prev: EstadoFichaPerfil[] = []) => [...prev, nuevoEstado],
      );
    },
  });

  return {
    estados: estadosQuery.data ?? [],
    catalogoEstados: catalogoEstadosQuery.data ?? [],
    isLoading: estadosQuery.isLoading || catalogoEstadosQuery.isLoading,
    isError: estadosQuery.isError || catalogoEstadosQuery.isError,
    agregar,
  };
}
