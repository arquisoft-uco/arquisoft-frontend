import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useModificarObservacionItem } from './useModificarObservacionItem';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { modificarObservacionItem: vi.fn() },
}));

const modificar = vi.mocked(fichasPerfilService.modificarObservacionItem);

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

const REQ = { observacionItemId: 'o-1', observacion: 'Texto' };
const CLAVE_OBSERVACIONES = ['fichas-perfil', 'f-1', 'asesor-observaciones'];
const CLAVE_REVISIONES = ['fichas-perfil', 'f-1', 'asesor-revisiones'];

describe('useModificarObservacionItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama al service con el request e invalida solo las observaciones al tener éxito', async () => {
    // Arrange
    modificar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(modificar.mock.calls[0][0]).toEqual(REQ);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
    expect(invalidar).not.toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES });
  });

  it('invalida las revisiones y las observaciones cuando el service rechaza', async () => {
    // Arrange
    modificar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useModificarObservacionItem('f-1'), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQ));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_REVISIONES });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVE_OBSERVACIONES });
  });
});
