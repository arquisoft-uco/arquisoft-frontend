import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { RegistrarItemCuantitativoAsesorRequest } from '../models/RegistrarItemCuantitativoAsesorRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarItemCuantitativoAsesor } from './useRegistrarItemCuantitativoAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    registrarItemCuantitativoAsesor: vi.fn(),
  },
}));

const registrar = vi.mocked(evaluacionesService.registrarItemCuantitativoAsesor);

const request: RegistrarItemCuantitativoAsesorRequest = {
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

describe('useRegistrarItemCuantitativoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida solo la lista de ítems cuantitativos con la key exacta tras registrar', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'i-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCuantitativoAsesor(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledTimes(1);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['evaluaciones', 'items-cuantitativos-asesor'],
    });
  });

  it('no invalida la lista cuando el registro falla', async () => {
    // Arrange
    registrar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCuantitativoAsesor(), {
      wrapper: Wrapper,
    });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
