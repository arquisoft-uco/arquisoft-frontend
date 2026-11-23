import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '../../../test-utils/render';
import { MENSAJES_VALIDACION } from '../../../shared/validation';
import { useListadoVersionesArtefacto } from './useListadoVersionesArtefacto';

const PAGINA_VACIA = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

type Consultar = Parameters<typeof useListadoVersionesArtefacto>[0]['consultar'];

function renderizar(ruta: string, consultar: Consultar) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ruta]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  }
  return renderHook(() => useListadoVersionesArtefacto({ rol: 'asesor', consultar }), {
    wrapper: Wrapper,
  });
}

describe('useListadoVersionesArtefacto', () => {
  const consultar = vi.fn<Consultar>();

  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(PAGINA_VACIA);
  });

  it('con el rango invertido expone errorFechas y no consulta', () => {
    // Act
    const { result } = renderizar('/artefactos?desde=2026-11-10&hasta=2026-11-01', consultar);

    // Assert
    expect(result.current.errorFechas).toBe(MENSAJES_VALIDACION.rangoFechasInvertido);
    expect(result.current.hayFiltros).toBe(true);
    expect(consultar).not.toHaveBeenCalled();
  });

  it('con un rango válido o con el mismo día consulta sin errorFechas', async () => {
    // Act
    const valido = renderizar('/artefactos?desde=2026-11-01&hasta=2026-11-10', consultar);
    await waitFor(() => expect(valido.result.current.isSuccess).toBe(true));
    const mismoDia = renderizar('/artefactos?desde=2026-11-10&hasta=2026-11-10', consultar);
    await waitFor(() => expect(mismoDia.result.current.isSuccess).toBe(true));

    // Assert
    expect(valido.result.current.errorFechas).toBeUndefined();
    expect(mismoDia.result.current.errorFechas).toBeUndefined();
    expect(consultar).toHaveBeenCalledTimes(2);
  });
});
