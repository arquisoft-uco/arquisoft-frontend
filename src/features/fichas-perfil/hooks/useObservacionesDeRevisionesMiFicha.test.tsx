import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { fichasPerfilService } from '../services/fichasPerfilService';
import type { ObservacionItem } from '../models/ObservacionItem';
import { useFichaPerfilIdEstudiante } from './useFichaPerfilIdEstudiante';
import { useObservacionesDeRevisionesMiFicha } from './useObservacionesDeRevisionesMiFicha';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: { consultarObservacionesItemEstudiante: vi.fn() },
}));
vi.mock('./useFichaPerfilIdEstudiante', () => ({ useFichaPerfilIdEstudiante: vi.fn() }));

const consultar = vi.mocked(fichasPerfilService.consultarObservacionesItemEstudiante);
const idEstudiante = vi.mocked(useFichaPerfilIdEstudiante);

function observacion(id: string, revisionItemId: string, estadoId: string): ObservacionItem {
  return { id, revisionItemId, observacion: 'x', estadoId, estadoNombre: estadoId };
}

function pagina(content: ObservacionItem[], totalElements = content.length) {
  return {
    content,
    page: 0,
    size: 100,
    totalElements,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function conFicha(fichaPerfilId: string | null) {
  idEstudiante.mockReturnValue({ fichaPerfilId } as ReturnType<typeof useFichaPerfilIdEstudiante>);
}

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useObservacionesDeRevisionesMiFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    conFicha('f-1');
  });

  it('consulta con revisionItem IN ids y tamaño 100, y arma el resumen por revisión', async () => {
    // Arrange
    consultar.mockResolvedValue(
      pagina([
        observacion('o-1', 'r-1', 'PENDIENTE'),
        observacion('o-2', 'r-1', 'CERRADO'),
        observacion('o-3', 'r-2', 'CERRADO'),
      ]),
    );

    // Act
    const { result } = renderHook(() => useObservacionesDeRevisionesMiFicha(['r-2', 'r-1']), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(result.current.verificable).toBe(true));
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 100,
      filtros: {
        tipo: 'PREDICADO_MULTIVALOR',
        campo: 'revisionItem',
        operador: 'IN',
        valores: ['r-1', 'r-2'],
      },
    });
    expect(result.current.resumenPorRevision.get('r-1')).toEqual({ total: 2, pendientes: 1 });
    expect(result.current.resumenPorRevision.get('r-2')).toEqual({ total: 1, pendientes: 0 });
  });

  it('no es verificable ante un error ni cuando hay más observaciones de las recibidas', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('falla'));

    // Act
    const conError = renderHook(() => useObservacionesDeRevisionesMiFicha(['r-1']), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalled());
    await waitFor(() => expect(conError.result.current.cargando).toBe(false));
    expect(conError.result.current.verificable).toBe(false);
    expect(conError.result.current.resumenPorRevision.size).toBe(0);
    conError.unmount();

    // Arrange
    consultar.mockResolvedValue(pagina([observacion('o-1', 'r-1', 'CERRADO')], 150));

    // Act
    const incompleto = renderHook(() => useObservacionesDeRevisionesMiFicha(['r-1']), {
      wrapper: crearWrapper(),
    });

    // Assert
    await waitFor(() => expect(incompleto.result.current.cargando).toBe(false));
    expect(incompleto.result.current.verificable).toBe(false);
    expect(incompleto.result.current.resumenPorRevision.size).toBe(0);
  });

  it('no consulta sin ids ni sin ficha activa', () => {
    // Act
    const sinIds = renderHook(() => useObservacionesDeRevisionesMiFicha([]), {
      wrapper: crearWrapper(),
    });
    sinIds.unmount();
    conFicha(null);
    renderHook(() => useObservacionesDeRevisionesMiFicha(['r-1']), { wrapper: crearWrapper() });

    // Assert
    expect(consultar).not.toHaveBeenCalled();
  });
});
