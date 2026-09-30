import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useEstadosFicha } from './useEstadosFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getEstadosFicha: vi.fn(),
  },
}));

const getEstadosFicha = vi.mocked(fichasPerfilService.getEstadosFicha);

const ESTADOS = [
  { id: '1', nombre: 'En Construcción', descripcion: 'La ficha está en construcción' },
  { id: '2', nombre: 'Disponible Para Evaluación', descripcion: 'Lista para evaluar' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta getEstadosFicha y expone el catálogo en data', async () => {
    // Arrange
    getEstadosFicha.mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosFicha(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosFicha).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(ESTADOS);
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    getEstadosFicha.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosFicha(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
