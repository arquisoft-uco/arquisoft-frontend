import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { bibliotecaService } from '../services/bibliotecaService';
import { useCambiarEstadoDocumentacion } from './useCambiarEstadoDocumentacion';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: {
    cambiarEstadoDocumentacion: vi.fn(),
  },
}));

const cambiar = vi.mocked(bibliotecaService.cambiarEstadoDocumentacion);

const CLAVE_DOCUMENTACIONES = ['biblioteca', 'documentaciones'];

function montar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  const { result } = renderHook(() => useCambiarEstadoDocumentacion(), { wrapper: Wrapper });
  return { result, invalidar };
}

describe('useCambiarEstadoDocumentacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id y el estado destino e invalida el listado de documentaciones', async () => {
    // Arrange
    cambiar.mockResolvedValue(undefined);
    const { result, invalidar } = montar();

    // Act
    await act(() => result.current.mutateAsync({ documentacionId: 'd-1', estado: 'PUBLICADO' }));

    // Assert
    expect(cambiar).toHaveBeenCalledWith('d-1', { estado: 'PUBLICADO' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_DOCUMENTACIONES });
  });

  it.each(['DOCUMENTACION_NO_ENCONTRADA', 'DOCUMENTACION_ESTADO_SIN_CAMBIO'])(
    'con %s invalida el listado por estar desactualizado',
    async (errorCode) => {
      // Arrange
      cambiar.mockRejectedValue(errorApi(422, { errorCode, message: 'x' }));
      const { result, invalidar } = montar();

      // Act
      act(() => result.current.mutate({ documentacionId: 'd-1', estado: 'PUBLICADO' }));
      await waitFor(() => expect(result.current.isError).toBe(true));

      // Assert
      expect(invalidar).toHaveBeenCalledTimes(1);
      expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_DOCUMENTACIONES });
    },
  );

  it('con otro error no invalida nada', async () => {
    // Arrange
    cambiar.mockRejectedValue(
      errorApi(422, { errorCode: 'DOCUMENTACION_ESTADO_DESTINO_NO_PERMITIDO', message: 'x' }),
    );
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate({ documentacionId: 'd-1', estado: 'NO_PUBLICADO' }));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(invalidar).not.toHaveBeenCalled();
  });
});
