import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, type AxiosResponse } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { entregablesService } from '../services/entregablesService';
import { useVistaPreviaPaquete } from './useVistaPreviaPaquete';

vi.mock('../services/entregablesService', () => ({
  entregablesService: { consultarVistaPreviaPaquete: vi.fn() },
}));

const consultar = vi.mocked(entregablesService.consultarVistaPreviaPaquete);

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useVistaPreviaPaquete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la vista previa del proyecto bajo la key del plan', async () => {
    // Arrange
    const datos = {
      cantidad: 1,
      artefactos: [{ artefacto: 'a', documento: 'D', numeroVersion: 1 }],
    };
    consultar.mockResolvedValue(datos);
    const queryClient = new QueryClient();

    // Act
    const { result } = renderHook(() => useVistaPreviaPaquete('p-1'), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual(datos));
    expect(consultar).toHaveBeenCalledWith('p-1');
    expect(queryClient.getQueryData(['entregables', 'vista-previa-paquete', 'p-1'])).toEqual(datos);
  });

  it('no consulta sin proyecto', () => {
    // Act
    renderHook(() => useVistaPreviaPaquete(''), {
      wrapper: crearWrapper(new QueryClient()),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });

  it('no reintenta un 422 de negocio', async () => {
    // Arrange
    const respuesta = { status: 422, data: {} } as AxiosResponse;
    consultar.mockRejectedValue(
      new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, respuesta),
    );

    // Act
    const { result } = renderHook(() => useVistaPreviaPaquete('p-1'), {
      wrapper: crearWrapper(new QueryClient()),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(consultar).toHaveBeenCalledTimes(1);
  });
});
