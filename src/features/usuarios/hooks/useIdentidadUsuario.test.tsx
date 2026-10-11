import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useIdentidadUsuario } from './useIdentidadUsuario';
import { usuariosService } from '../services/usuariosService';
import type { IdentidadUsuario } from '../models/IdentidadUsuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: { consultarIdentidadUsuario: vi.fn() },
}));

const IDENTIDAD: IdentidadUsuario = { nombres: 'Marta', apellidos: 'Ríos' };

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function crearQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('useIdentidadUsuario', () => {
  beforeEach(() => {
    vi.mocked(usuariosService.consultarIdentidadUsuario).mockReset();
  });

  it('consulta la identidad con el id, la guarda bajo su key y expone isError si falla', async () => {
    // Arrange
    const queryClient = crearQueryClient();
    vi.mocked(usuariosService.consultarIdentidadUsuario).mockResolvedValue(IDENTIDAD);

    // Act
    const { result } = renderHook(() => useIdentidadUsuario('u-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual(IDENTIDAD));
    expect(usuariosService.consultarIdentidadUsuario).toHaveBeenCalledWith('u-1');
    expect(queryClient.getQueryData(['usuarios', 'identidad', 'u-1'])).toEqual(IDENTIDAD);

    // Arrange
    vi.mocked(usuariosService.consultarIdentidadUsuario).mockRejectedValue(new Error('503'));

    // Act
    const fallido = renderHook(() => useIdentidadUsuario('u-2'), {
      wrapper: crearWrapper(crearQueryClient()),
    });

    // Assert
    await waitFor(() => expect(fallido.result.current.isError).toBe(true));
  });

  it('no consulta cuando el id está vacío', () => {
    // Act
    renderHook(() => useIdentidadUsuario(''), { wrapper: crearWrapper(crearQueryClient()) });

    // Assert
    expect(usuariosService.consultarIdentidadUsuario).not.toHaveBeenCalled();
  });
});
