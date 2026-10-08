import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { RegistrarItemCualitativoJuradoRequest } from '../models/RegistrarItemCualitativoJuradoRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarItemCualitativoJurado } from './useRegistrarItemCualitativoJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    registrarItemCualitativoJurado: vi.fn(),
  },
}));

const registrar = vi.mocked(evaluacionesService.registrarItemCualitativoJurado);

const request: RegistrarItemCualitativoJuradoRequest = {
  nombre: 'Claridad',
  descripcion: 'El documento se comprende sin ambigüedades.',
};

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useRegistrarItemCualitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida la lista de ítems cualitativos con la key exacta tras registrar', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'i-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['evaluaciones', 'items-cualitativos-jurado'],
    });
  });

  it('no invalida la lista cuando el registro falla', async () => {
    // Arrange
    registrar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCualitativoJurado(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
