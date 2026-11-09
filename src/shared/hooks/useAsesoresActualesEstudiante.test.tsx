import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../test-utils/render';
import { asesoresActualesEstudianteService } from '../services/asesoresActualesEstudianteService';
import { useAsesoresActualesEstudiante } from './useAsesoresActualesEstudiante';

vi.mock('../services/asesoresActualesEstudianteService', () => ({
  asesoresActualesEstudianteService: { consultarAsesoresActuales: vi.fn() },
}));

const consultar = vi.mocked(asesoresActualesEstudianteService.consultarAsesoresActuales);

const ASESORES = [
  {
    proyectoGradoId: 'pg-1',
    tituloProyecto: 'Sistema de riego',
    asesorId: 'as-1',
    identificador: '1',
    nombre: 'Ana',
    email: 'ana@uco.edu.co',
  },
];

function crearContexto() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient };
}

describe('useAsesoresActualesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el service y cachea la lista bajo su key', async () => {
    // Arrange
    consultar.mockResolvedValue(ASESORES);
    const { Wrapper, queryClient } = crearContexto();

    // Act
    const { result } = renderHook(() => useAsesoresActualesEstudiante(), { wrapper: Wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ASESORES);
    expect(
      queryClient.getQueryData(['proyectos-grado', 'estudiante', 'asesores-actuales']),
    ).toEqual(ASESORES);
  });

  it('expone el error cuando el service falla', async () => {
    consultar.mockRejectedValue(new Error('falló'));
    const { Wrapper } = crearContexto();

    const { result } = renderHook(() => useAsesoresActualesEstudiante(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
