import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useEstadosUsuario } from './useEstadosUsuario';
import { usuariosService } from '../services/usuariosService';
import type { EstadoUsuario } from '../models/EstadoUsuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: { getEstadosUsuario: vi.fn() },
}));

const ESTADOS: EstadoUsuario[] = [
  { id: 'ACTIVO', nombre: 'Activo', descripcion: 'Puede operar' },
  { id: 'INACTIVO', nombre: 'Inactivo', descripcion: 'Sin acceso' },
];

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosUsuario', () => {
  beforeEach(() => {
    vi.mocked(usuariosService.getEstadosUsuario).mockReset();
  });

  it('consulta el catálogo una vez y expone los estados', async () => {
    // Arrange
    vi.mocked(usuariosService.getEstadosUsuario).mockResolvedValue(ESTADOS);

    // Act
    const { result } = renderHook(() => useEstadosUsuario(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.data).toEqual(ESTADOS));
    expect(usuariosService.getEstadosUsuario).toHaveBeenCalledTimes(1);
  });

  it('expone isError cuando el service falla', async () => {
    // Arrange
    vi.mocked(usuariosService.getEstadosUsuario).mockRejectedValue(new Error('403'));

    // Act
    const { result } = renderHook(() => useEstadosUsuario(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
