import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarItemsMiFichaPerfil: vi.fn(), agregarItemFichaPerfil: vi.fn(), modificarItem: vi.fn() },
}));
vi.mock('./useFichaPerfilIdEstudiante', () => ({ useFichaPerfilIdEstudiante: vi.fn() }));
vi.mock('./useMiFichaPerfil', () => ({ useMiFichaPerfil: () => ({ ficha: { id: 'f-1' } }) }));
vi.mock('./useTiposItem', () => ({
  useTiposItem: () => ({ data: [], isLoading: false, isError: false }),
}));

const consultar = vi.mocked(fichasPerfilService.consultarItemsMiFichaPerfil);
const idEstudiante = vi.mocked(useFichaPerfilIdEstudiante);

const ITEM = { id: 'i-1', fichaPerfilId: 'f-1', tipoItem: { id: 't-1', nombre: 'Objetivo' }, contenido: 'Medir' };

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function conFicha(fichaPerfilId: string | null) {
  idEstudiante.mockReturnValue({ fichaPerfilId } as ReturnType<typeof useFichaPerfilIdEstudiante>);
}

describe('useItemsMiFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta los ítems de la ficha activa y los expone', async () => {
    // Arrange
    conFicha('f-1');
    consultar.mockResolvedValue([ITEM]);

    // Act
    const { result } = renderHook(() => useItemsMiFicha(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.items).toEqual([ITEM]));
    expect(consultar).toHaveBeenCalledWith('f-1');
  });

  it('guarda los ítems bajo la key de la ficha activa', async () => {
    // Arrange
    conFicha('f-1');
    consultar.mockResolvedValue([ITEM]);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    // Act
    const { result } = renderHook(() => useItemsMiFicha(), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.items).toEqual([ITEM]));
    expect(queryClient.getQueryData(['fichas-perfil', 'estudiante', 'f-1', 'items'])).toEqual([ITEM]);
  });

  it('no consulta mientras no haya ficha activa', () => {
    // Arrange
    conFicha(null);

    // Act
    const { result } = renderHook(() => useItemsMiFicha(), { wrapper: crearWrapper() });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);
  });

  it('marca isError cuando el service falla', async () => {
    // Arrange
    conFicha('f-1');
    consultar.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useItemsMiFicha(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  describe('agregar', () => {
    it('invalida la key de ítems de la ficha y vuelve a consultarlos tras agregar', async () => {
      // Arrange
      conFicha('f-1');
      consultar.mockResolvedValue([]);
      vi.mocked(fichasPerfilService.agregarItemFichaPerfil).mockResolvedValue({ id: 'i-2' });
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(() => useItemsMiFicha(), { wrapper });
      await waitFor(() => expect(consultar).toHaveBeenCalledTimes(1));
      const req = { fichaPerfilId: 'f-1', tipoItemId: 't-1', contenido: 'Medir' };

      // Act
      await result.current.agregar.mutateAsync(req);

      // Assert
      expect(fichasPerfilService.agregarItemFichaPerfil).toHaveBeenCalledWith(req);
      expect(invalidar).toHaveBeenCalledWith({
        queryKey: ['fichas-perfil', 'estudiante', 'f-1', 'items'],
      });
      await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    });

    it('no invalida los ítems cuando el service falla', async () => {
      // Arrange
      conFicha('f-1');
      consultar.mockResolvedValue([]);
      vi.mocked(fichasPerfilService.agregarItemFichaPerfil).mockRejectedValue(new Error('422'));
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      const { result } = renderHook(() => useItemsMiFicha(), { wrapper });
      await waitFor(() => expect(consultar).toHaveBeenCalledTimes(1));

      // Act
      await expect(
        result.current.agregar.mutateAsync({ fichaPerfilId: 'f-1', tipoItemId: 't-1', contenido: 'x' }),
      ).rejects.toThrow('422');

      // Assert
      expect(invalidar).not.toHaveBeenCalled();
    });
  });

  describe('modificar', () => {
    function conCliente() {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );
      return { invalidar, wrapper };
    }

    it('invalida la key de ítems de la ficha y vuelve a consultarlos tras modificar', async () => {
      // Arrange
      conFicha('f-1');
      consultar.mockResolvedValue([ITEM]);
      vi.mocked(fichasPerfilService.modificarItem).mockResolvedValue(undefined);
      const { invalidar, wrapper } = conCliente();
      const { result } = renderHook(() => useItemsMiFicha(), { wrapper });
      await waitFor(() => expect(consultar).toHaveBeenCalledTimes(1));
      const req = { itemId: 'i-1', contenido: 'Nuevo' };

      // Act
      await result.current.modificar.mutateAsync(req);

      // Assert
      expect(fichasPerfilService.modificarItem).toHaveBeenCalledWith(req);
      expect(invalidar).toHaveBeenCalledWith({
        queryKey: ['fichas-perfil', 'estudiante', 'f-1', 'items'],
      });
      await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    });

    it('no invalida los ítems cuando el service falla', async () => {
      // Arrange
      conFicha('f-1');
      consultar.mockResolvedValue([ITEM]);
      vi.mocked(fichasPerfilService.modificarItem).mockRejectedValue(new Error('422'));
      const { invalidar, wrapper } = conCliente();
      const { result } = renderHook(() => useItemsMiFicha(), { wrapper });
      await waitFor(() => expect(consultar).toHaveBeenCalledTimes(1));

      // Act
      await expect(
        result.current.modificar.mutateAsync({ itemId: 'i-1', contenido: 'x' }),
      ).rejects.toThrow('422');

      // Assert
      expect(invalidar).not.toHaveBeenCalled();
    });
  });
});
