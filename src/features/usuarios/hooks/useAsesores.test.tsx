import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Asesor } from '../models/Asesor';
import { usuariosService } from '../services/usuariosService';
import { useAsesores } from './useAsesores';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    consultarAsesoresAdministrador: vi.fn(),
    registrarUsuario: vi.fn(),
  },
}));

const consultar = vi.mocked(usuariosService.consultarAsesoresAdministrador);

function crearPagina(numero: number, content: Asesor[]): Page<Asesor> {
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

const asesor: Asesor = {
  id: 'c-1',
  identificador: '1001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  contacto: '3001234567',
  estado: 'ACTIVO',
  vigente: true,
};

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useAsesores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la página 0 con tamaño 10 y devuelve los datos del service', async () => {
    // Arrange
    const pagina = crearPagina(0, [asesor]);
    consultar.mockResolvedValue(pagina);

    // Act
    const { result } = renderHook(() => useAsesores(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10);
    expect(result.current.data).toEqual(pagina);
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
  });

  it('vuelve a consultar con la página nueva cuando se llama a goToPage', async () => {
    // Arrange
    consultar.mockImplementation((page = 0) =>
      Promise.resolve(crearPagina(page, page === 0 ? [asesor] : [])),
    );
    const { result } = renderHook(() => useAsesores(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenLastCalledWith(1, 10));
    await waitFor(() => expect(result.current.data?.page).toBe(1));
    expect(result.current.page).toBe(1);
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useAsesores(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
