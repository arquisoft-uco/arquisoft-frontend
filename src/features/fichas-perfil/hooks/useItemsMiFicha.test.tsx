import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useItemsMiFicha } from './useItemsMiFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarItemsMiFichaPerfil: vi.fn() },
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
});
