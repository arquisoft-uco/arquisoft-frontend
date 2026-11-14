import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AxiosError } from 'axios';
import { renderHook, waitFor } from '../../../test-utils/render';
import { mapasRutaService } from '../services/mapasRutaService';
import { usePlanEstimadoTarea } from './usePlanEstimadoTarea';

vi.mock('../services/mapasRutaService', () => ({
  mapasRutaService: { consultarPlanesEstimadosTarea: vi.fn() },
}));

const consultar = vi.mocked(mapasRutaService.consultarPlanesEstimadosTarea);

const PLAN = { id: 'p-1', tareaId: 't-1', tiempoEstimadoDias: 5, descripcionEstimado: null };

function pagina(content: (typeof PLAN)[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('usePlanEstimadoTarea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el plan, no permite agregar y consulta con pagina 0 y tamanio 10', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([PLAN]));

    // Act
    const { result } = renderHook(() => usePlanEstimadoTarea('t-1'));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    // Assert
    expect(consultar).toHaveBeenCalledWith('t-1', { pagina: 0, tamanio: 10 });
    expect(result.current.plan).toEqual(PLAN);
    expect(result.current.puedeAgregar).toBe(false);
  });

  it('con página vacía no hay plan y permite agregar', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    const { result } = renderHook(() => usePlanEstimadoTarea('t-1'));
    await waitFor(() => expect(result.current.cargando).toBe(false));

    // Assert
    expect(result.current.plan).toBeUndefined();
    expect(result.current.puedeAgregar).toBe(true);
  });

  it('no permite agregar mientras carga', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => undefined));

    // Act
    const { result } = renderHook(() => usePlanEstimadoTarea('t-1'));

    // Assert
    expect(result.current.cargando).toBe(true);
    expect(result.current.puedeAgregar).toBe(false);
  });

  it('ante un error 400 expone hayError sin reintentar y no permite agregar', async () => {
    // Arrange
    consultar.mockRejectedValue(
      new AxiosError('Bad request', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
        data: {},
      } as never),
    );

    // Act
    const { result } = renderHook(() => usePlanEstimadoTarea('t-1'));
    await waitFor(() => expect(result.current.hayError).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(result.current.puedeAgregar).toBe(false);
  });

  it('con habilitado false no consulta y queda cargando', () => {
    // Act
    const { result } = renderHook(() => usePlanEstimadoTarea('t-1', false));

    // Assert
    expect(consultar).not.toHaveBeenCalled();
    expect(result.current.cargando).toBe(true);
    expect(result.current.puedeAgregar).toBe(false);
  });
});
