import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { RegistrarItemCuantitativoJuradoRequest } from '../models/RegistrarItemCuantitativoJuradoRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarItemCuantitativoJurado } from './useRegistrarItemCuantitativoJurado';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    registrarItemCuantitativoJurado: vi.fn(),
  },
}));

const registrar = vi.mocked(evaluacionesService.registrarItemCuantitativoJurado);

const request: RegistrarItemCuantitativoJuradoRequest = {
  nombre: 'Rigor',
  descripcion: 'Calidad del método.',
  categoriaId: 'c-1',
  valor: 30,
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

describe('useRegistrarItemCuantitativoJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida solo la lista de ítems cuantitativos con la key exacta tras registrar', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'i-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCuantitativoJurado(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['evaluaciones', 'items-cuantitativos-jurado'],
    });
  });

  it('no invalida la lista cuando el registro falla', async () => {
    // Arrange
    registrar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCuantitativoJurado(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
