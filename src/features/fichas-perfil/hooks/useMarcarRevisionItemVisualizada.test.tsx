import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useMarcarRevisionItemVisualizada } from './useMarcarRevisionItemVisualizada';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { marcarRevisionItemVisualizada: vi.fn() },
}));
vi.mock('./useFichaPerfilIdEstudiante', () => ({ useFichaPerfilIdEstudiante: vi.fn() }));

const marcar = vi.mocked(fichasPerfilService.marcarRevisionItemVisualizada);

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

describe('useMarcarRevisionItemVisualizada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFichaPerfilIdEstudiante).mockReturnValue({
      fichaPerfilId: 'f-1',
    } as ReturnType<typeof useFichaPerfilIdEstudiante>);
  });

  it('llama al service con el id de la revisión e invalida las revisiones de la ficha del estudiante', async () => {
    // Arrange
    marcar.mockResolvedValue(undefined);
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useMarcarRevisionItemVisualizada(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('r-1'));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(marcar.mock.calls[0][0]).toBe('r-1');
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'estudiante', 'f-1', 'revisiones'],
    });
  });

  it('invalida también cuando el service rechaza, porque la lista pudo estar desactualizada', async () => {
    // Arrange
    marcar.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useMarcarRevisionItemVisualizada(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate('r-1'));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ['fichas-perfil', 'estudiante', 'f-1', 'revisiones'],
    });
  });
});
