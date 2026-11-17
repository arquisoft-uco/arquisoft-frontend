import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { errorApi } from '../../../test-utils/errores-api';
import { bibliotecaService } from '../services/bibliotecaService';
import { useRegistrarDocumentacion } from './useRegistrarDocumentacion';

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: {
    registrarDocumentacion: vi.fn(),
  },
}));

const registrar = vi.mocked(bibliotecaService.registrarDocumentacion);

const CLAVE_ENTREGABLES = ['biblioteca', 'entregables-disponibles'];
const CLAVE_DOCUMENTACIONES = ['biblioteca', 'documentaciones'];

function montar() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  const { result } = renderHook(() => useRegistrarDocumentacion(), { wrapper: Wrapper });
  return { result, invalidar };
}

describe('useRegistrarDocumentacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía el id del entregable e invalida las listas de entregables y de documentaciones', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'd-1' });
    const { result, invalidar } = montar();

    // Act
    await act(() => result.current.mutateAsync('e-1'));

    // Assert
    expect(registrar).toHaveBeenCalledWith({ entregableProyectoGradoId: 'e-1' });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ENTREGABLES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_DOCUMENTACIONES });
  });

  it.each(['DOCUMENTACION_YA_REGISTRADA', 'ENTREGABLE_PROYECTO_GRADO_NO_ENCONTRADO'])(
    'con %s invalida solo la lista de entregables',
    async (errorCode) => {
      // Arrange
      registrar.mockRejectedValue(errorApi(422, { errorCode, message: 'x' }));
      const { result, invalidar } = montar();

      // Act
      act(() => result.current.mutate('e-1'));
      await waitFor(() => expect(result.current.isError).toBe(true));

      // Assert
      expect(invalidar).toHaveBeenCalledTimes(1);
      expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_ENTREGABLES });
    },
  );

  it('con otro error no invalida nada', async () => {
    // Arrange
    registrar.mockRejectedValue(
      errorApi(422, { errorCode: 'ESTUDIANTE_PROYECTO_GRADO_SIN_AUTORES', message: 'x' }),
    );
    const { result, invalidar } = montar();

    // Act
    act(() => result.current.mutate('e-1'));
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Assert
    expect(invalidar).not.toHaveBeenCalled();
  });
});
