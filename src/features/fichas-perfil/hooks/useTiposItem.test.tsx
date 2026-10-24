import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useTiposItem } from './useTiposItem';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    consultarTodosTipoItem: vi.fn(),
  },
}));

const consultarTodosTipoItem = vi.mocked(fichasPerfilService.consultarTodosTipoItem);

const TIPOS = [
  { id: '1', nombre: 'Problema', descripcion: 'Describe el problema' },
  { id: '2', nombre: 'Objetivo', descripcion: 'Describe el objetivo' },
];

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useTiposItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta consultarTodosTipoItem y expone el catálogo en data', async () => {
    // Arrange
    consultarTodosTipoItem.mockResolvedValue(TIPOS);

    // Act
    const { result } = renderHook(() => useTiposItem(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultarTodosTipoItem).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(TIPOS);
  });

  it('expone isError en true y data indefinido cuando el service rechaza', async () => {
    // Arrange
    consultarTodosTipoItem.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = renderHook(() => useTiposItem(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
