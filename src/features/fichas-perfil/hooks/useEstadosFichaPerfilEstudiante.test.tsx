import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useEstadosFichaPerfilEstudiante } from './useEstadosFichaPerfilEstudiante';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { getEstadosFichaPerfilEstudiante: vi.fn() },
}));
vi.mock('./useFichaPerfilIdEstudiante', () => ({ useFichaPerfilIdEstudiante: vi.fn() }));

const consultar = vi.mocked(fichasPerfilService.getEstadosFichaPerfilEstudiante);
const idEstudiante = vi.mocked(useFichaPerfilIdEstudiante);

const HISTORIAL = [
  { id: 'REVISION', nombre: 'En revision', fechaActualizacion: '2026-09-02T10:00:00Z' },
  { id: 'EN_CONSTRUCCION', nombre: 'En construccion', fechaActualizacion: '2026-09-01T10:00:00Z' },
];

function conFicha(fichaPerfilId: string | null) {
  idEstudiante.mockReturnValue({ fichaPerfilId } as ReturnType<typeof useFichaPerfilIdEstudiante>);
}

function crearWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useEstadosFichaPerfilEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el historial de la ficha y lo guarda bajo la key del plan', async () => {
    // Arrange
    conFicha('f-1');
    consultar.mockResolvedValue(HISTORIAL);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEstadosFichaPerfilEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.historial).toEqual(HISTORIAL));
    expect(consultar).toHaveBeenCalledWith('f-1');
    expect(result.current.fichaPerfilIdDisponible).toBe(true);
    expect(result.current.cargado).toBe(true);
    expect(
      queryClient.getQueryData(['fichas-perfil', 'estudiante', 'f-1', 'estados-ficha']),
    ).toEqual(HISTORIAL);
  });

  it('no llama al service cuando no hay id de ficha', () => {
    // Arrange
    conFicha(null);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEstadosFichaPerfilEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.fichaPerfilIdDisponible).toBe(false);
    expect(result.current.cargado).toBe(false);
    expect(result.current.historial).toEqual([]);
  });

  it('expone el error cuando falla la consulta', async () => {
    // Arrange
    conFicha('f-1');
    consultar.mockRejectedValue(new Error('fallo'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    // Act
    const { result } = renderHook(() => useEstadosFichaPerfilEstudiante(), {
      wrapper: crearWrapper(queryClient),
    });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.historial).toEqual([]);
  });
});
