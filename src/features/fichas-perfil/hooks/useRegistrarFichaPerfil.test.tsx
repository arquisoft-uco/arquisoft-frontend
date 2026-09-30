import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useRegistrarFichaPerfil } from './useRegistrarFichaPerfil';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    registrarFichaPerfil: vi.fn(),
  },
}));

const registrarFichaPerfil = vi.mocked(fichasPerfilService.registrarFichaPerfil);

const REQUEST = {
  tituloProyecto: 'Sistema de monitoreo',
  asesorFichaId: 'a-1',
  estudiantesIds: ['e-1'],
};

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, invalidar };
}

describe('useRegistrarFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registra la ficha e invalida la key de fichas-perfil en éxito', async () => {
    // Arrange
    registrarFichaPerfil.mockResolvedValue({ id: 'f-9' });
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarFichaPerfil(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQUEST));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(registrarFichaPerfil).toHaveBeenCalledWith(REQUEST);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['fichas-perfil'] });
  });

  it('no invalida nada cuando el service rechaza', async () => {
    // Arrange
    registrarFichaPerfil.mockRejectedValue(new Error('422'));
    const { Wrapper, invalidar } = crearContexto();
    const { result } = renderHook(() => useRegistrarFichaPerfil(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate(REQUEST));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidar).not.toHaveBeenCalled();
  });
});
