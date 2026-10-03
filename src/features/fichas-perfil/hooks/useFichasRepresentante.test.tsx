import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import type { FiltrosFichasRepresentante } from '../models/FiltrosFichasRepresentante';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichasRepresentante } from './useFichasRepresentante';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getFichasRepresentante: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.getFichasRepresentante);

const filtros: FiltrosFichasRepresentante = {
  titulo: 'monitoreo',
  asesorNombre: '',
  asesorEmail: '',
  estadoIds: ['st-1'],
};

const ficha: FichaPerfilRepresentante = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  asesorNombre: 'Ana Ruiz',
  asesorEmail: 'ana@uco.edu.co',
  estadoActual: 'Disponible para evaluación',
  estadoFechaActualizacion: '2026-09-01T10:00:00',
};

function crearPagina(numero: number, content: FichaPerfilRepresentante[]): Page<FichaPerfilRepresentante> {
  return {
    content,
    page: numero,
    size: 10,
    totalElements: 12,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: content.length === 0,
  };
}

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useFichasRepresentante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la página 0 con tamaño 10 y los filtros recibidos, y expone los datos', async () => {
    // Arrange
    const pagina = crearPagina(0, [ficha]);
    consultar.mockResolvedValue(pagina);

    // Act
    const { result } = renderHook(() => useFichasRepresentante(filtros), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10, filtros);
    expect(result.current.data).toEqual(pagina);
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
  });

  it('vuelve a consultar con la página nueva cuando se llama a goToPage', async () => {
    // Arrange
    consultar.mockImplementation((page) =>
      Promise.resolve(crearPagina(page, page === 0 ? [ficha] : [])),
    );
    const { result } = renderHook(() => useFichasRepresentante(filtros), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith(1, 10, filtros));
    await waitFor(() => expect(result.current.data?.page).toBe(1));
  });

  it('vuelve a consultar cuando cambian los filtros', async () => {
    // Arrange
    consultar.mockResolvedValue(crearPagina(0, [ficha]));
    const { result, rerender } = renderHook(({ f }) => useFichasRepresentante(f), {
      wrapper: crearWrapper(),
      initialProps: { f: filtros },
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const nuevos = { ...filtros, estadoIds: ['st-2'] };

    // Act
    rerender({ f: nuevos });

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith(0, 10, nuevos));
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useFichasRepresentante(filtros), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
