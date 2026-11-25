import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { EstadoRevisionAsesor } from '../models/artefactos';
import { artefactosService } from '../services/artefactosService';
import { SIN_REVISION } from '../utils/filtro-estado-revision';
import { useFiltroEstadoRevision } from './useFiltroEstadoRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { getEstadosRevisionAsesor: vi.fn() },
}));

const getEstados = vi.mocked(artefactosService.getEstadosRevisionAsesor);

const ESTADOS: EstadoRevisionAsesor[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Nueva revisión' },
  { id: 'CERRADA', nombre: 'Cerrada', descripcion: 'Revisión cerrada' },
];

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useFiltroEstadoRevision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEstados.mockResolvedValue(ESTADOS);
  });

  it('un id del catálogo da valor id, consulta nombre y espera al catálogo mientras carga', async () => {
    // Act
    const { result } = renderHook(() => useFiltroEstadoRevision('CERRADA'), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(result.current.esperandoCatalogo).toBe(true);
    await waitFor(() => expect(result.current.esperandoCatalogo).toBe(false));
    expect(result.current.valor).toBe('CERRADA');
    expect(result.current.consulta).toBe('Cerrada');
    expect(result.current.estados).toEqual(ESTADOS);
  });

  it('el sentinela no espera al catálogo y se conserva en valor y consulta', () => {
    // Act
    const { result } = renderHook(() => useFiltroEstadoRevision(SIN_REVISION), {
      wrapper: crearWrapper(),
    });

    // Assert
    expect(result.current.esperandoCatalogo).toBe(false);
    expect(result.current.valor).toBe(SIN_REVISION);
    expect(result.current.consulta).toBe(SIN_REVISION);
  });

  it('un valor desconocido o vacío queda en cadena vacía', async () => {
    // Act
    const desconocido = renderHook(() => useFiltroEstadoRevision('otro'), {
      wrapper: crearWrapper(),
    });
    const vacio = renderHook(() => useFiltroEstadoRevision(''), { wrapper: crearWrapper() });
    await waitFor(() => expect(desconocido.result.current.esperandoCatalogo).toBe(false));

    // Assert
    expect(desconocido.result.current.valor).toBe('');
    expect(desconocido.result.current.consulta).toBe('');
    expect(vacio.result.current.esperandoCatalogo).toBe(false);
    expect(vacio.result.current.valor).toBe('');
  });
});
