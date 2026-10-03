import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useCompanerosFichaPerfil } from './useCompanerosFichaPerfil';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarCompanerosFichaPerfil: vi.fn() },
}));

const consultar = vi.mocked(fichasPerfilService.consultarCompanerosFichaPerfil);

const COMPANERO = { idVinculo: 'v-2', id: 'e-2', nombre: 'Marta Gómez', email: 'marta@uco.edu.co' };

function crearCliente() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

describe('useCompanerosFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta los compañeros de la ficha y los guarda bajo la key de la ficha', async () => {
    // Arrange
    consultar.mockResolvedValue([COMPANERO]);
    const { queryClient, wrapper } = crearCliente();

    // Act
    const { result } = renderHook(() => useCompanerosFichaPerfil('f-1'), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual([COMPANERO]));
    expect(consultar).toHaveBeenCalledWith('f-1');
    expect(queryClient.getQueryData(['fichas-perfil', 'f-1', 'companeros'])).toEqual([COMPANERO]);
  });

  it('no consulta mientras no haya id de ficha', () => {
    // Arrange
    const { wrapper } = crearCliente();

    // Act
    const { result } = renderHook(() => useCompanerosFichaPerfil(null), { wrapper });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('marca isError cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));
    const { wrapper } = crearCliente();

    // Act
    const { result } = renderHook(() => useCompanerosFichaPerfil('f-1'), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
