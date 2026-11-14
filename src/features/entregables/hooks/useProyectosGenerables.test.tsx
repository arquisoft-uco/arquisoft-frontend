import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../../test-utils/render';
import { useProyectosAsesor } from './useProyectosAsesor';
import { useProyectosConEntregableVigente } from './useProyectosConEntregableVigente';
import { useProyectosGenerables } from './useProyectosGenerables';

vi.mock('./useProyectosAsesor', () => ({ useProyectosAsesor: vi.fn() }));
vi.mock('./useProyectosConEntregableVigente', () => ({
  useProyectosConEntregableVigente: vi.fn(),
}));

const proyectosMock = vi.mocked(useProyectosAsesor);
const vigentesMock = vi.mocked(useProyectosConEntregableVigente);
const refetchProyectos = vi.fn();
const refetchVigentes = vi.fn();

const P1 = { id: 'p-1', tituloProyecto: 'Uno', estado: { id: 'EN_PROCESO', nombre: 'En proceso' } };
const P2 = { id: 'p-2', tituloProyecto: 'Dos', estado: { id: 'ATRASADO', nombre: 'Atrasado' } };

function consultas(proyectos: object, vigentes: object) {
  const base = { isLoading: false, isError: false };
  proyectosMock.mockReturnValue({ ...base, refetch: refetchProyectos, ...proyectos } as never);
  vigentesMock.mockReturnValue({ ...base, refetch: refetchVigentes, ...vigentes } as never);
}

describe('useProyectosGenerables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('excluye los proyectos con entregable vigente y cuenta los que están en curso', () => {
    // Arrange
    consultas({ data: [P1, P2] }, { data: ['p-1'] });

    // Act
    const { result } = renderHook(() => useProyectosGenerables());

    // Assert
    expect(result.current.proyectos).toEqual([P2]);
    expect(result.current.totalEnCurso).toBe(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('carga o falla si cualquiera de las dos consultas lo hace y reintenta ambas', () => {
    // Arrange
    consultas({ data: [P1] }, { isLoading: true });
    const cargando = renderHook(() => useProyectosGenerables());
    consultas({ isError: true }, { data: [] });

    // Act
    const fallando = renderHook(() => useProyectosGenerables());
    fallando.result.current.refetch();

    // Assert
    expect(cargando.result.current.isLoading).toBe(true);
    expect(fallando.result.current.isError).toBe(true);
    expect(refetchProyectos).toHaveBeenCalled();
    expect(refetchVigentes).toHaveBeenCalled();
  });
});
