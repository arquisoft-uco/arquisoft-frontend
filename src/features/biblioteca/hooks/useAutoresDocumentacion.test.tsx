import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { AutorDocumentacion } from '../models/AutorDocumentacion';
import { bibliotecaService } from '../services/bibliotecaService';
import { useAutoresDocumentacion } from './useAutoresDocumentacion';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: {
    consultarAutoresDocumentacion: vi.fn(),
  },
}));

const consultarAutores = vi.mocked(bibliotecaService.consultarAutoresDocumentacion);

const AUTORES: AutorDocumentacion[] = [
  { id: 'a-1', identificador: 'AUT-01', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useAutoresDocumentacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin id no llama al service', () => {
    // Act
    const { result } = renderHook(() => useAutoresDocumentacion(''), { wrapper: crearWrapper() });

    // Assert
    expect(consultarAutores).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('con id consulta el service con ese id y expone los autores', async () => {
    // Arrange
    consultarAutores.mockResolvedValue(AUTORES);

    // Act
    const { result } = renderHook(() => useAutoresDocumentacion('d-1'), {
      wrapper: crearWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultarAutores).toHaveBeenCalledWith('d-1');
    expect(result.current.data).toEqual(AUTORES);
  });

  it('expone isError cuando el service rechaza', async () => {
    // Arrange
    consultarAutores.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useAutoresDocumentacion('d-1'), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
