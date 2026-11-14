import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstadoDocumentacion } from '../models/biblioteca';
import { bibliotecaService } from '../services/bibliotecaService';
import { useEstadosDocumentacion } from './useEstadosDocumentacion';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: {
    getEstadosDocumentacion: vi.fn(),
  },
}));

const getEstadosDocumentacion = vi.mocked(bibliotecaService.getEstadosDocumentacion);

const ESTADOS: EstadoDocumentacion[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Aún sin publicar' },
  { id: 'PUBLICADO', nombre: 'Publicado', descripcion: 'Visible en la biblioteca' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosDocumentacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deshabilitado no llama al service', () => {
    // Act
    const { result } = renderHook(() => useEstadosDocumentacion(false), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(getEstadosDocumentacion).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('habilitado expone el catálogo en data', async () => {
    // Arrange
    getEstadosDocumentacion.mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosDocumentacion(true), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(getEstadosDocumentacion).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(ESTADOS);
  });

  it('expone isError cuando el service rechaza', async () => {
    // Arrange
    getEstadosDocumentacion.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useEstadosDocumentacion(true), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
