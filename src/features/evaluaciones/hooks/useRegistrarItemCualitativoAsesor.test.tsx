import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { RegistrarItemCualitativoAsesorRequest } from '../models/RegistrarItemCualitativoAsesorRequest';
import { evaluacionesService } from '../services/evaluacionesService';
import { useRegistrarItemCualitativoAsesor } from './useRegistrarItemCualitativoAsesor';

vi.mock('../services/evaluacionesService', () => ({
  evaluacionesService: {
    registrarItemCualitativoAsesor: vi.fn(),
  },
}));

const registrar = vi.mocked(evaluacionesService.registrarItemCualitativoAsesor);

const request: RegistrarItemCualitativoAsesorRequest = {
  nombre: 'Claridad',
  descripcion: 'El documento se comprende sin ambigüedades.',
  peso: 10,
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

describe('useRegistrarItemCualitativoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invalida la lista de ítems cualitativos con la key exacta tras registrar', async () => {
    // Arrange
    registrar.mockResolvedValue({ id: 'i-1' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCualitativoAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrar).toHaveBeenCalledWith(request);
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['evaluaciones', 'items-cualitativos-asesor'],
    });
  });

  it('no invalida la lista cuando el registro falla', async () => {
    // Arrange
    registrar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarItemCualitativoAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(request));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
