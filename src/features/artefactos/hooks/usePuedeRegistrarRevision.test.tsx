import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { usePuedeRegistrarRevision } from './usePuedeRegistrarRevision';

vi.mock('../services/artefactosService', () => ({
  artefactosService: {
    getIdsArtefactosOmitidosAsesor: vi.fn(),
    consultarVersionesArtefactoAsesor: vi.fn(),
  },
}));

const getIds = vi.mocked(artefactosService.getIdsArtefactosOmitidosAsesor);
const consultar = vi.mocked(artefactosService.consultarVersionesArtefactoAsesor);

function version(parcial: Partial<VersionArtefacto>): VersionArtefacto {
  return {
    id: 'v-2',
    artefacto: 'a-1',
    version: 2,
    fechaCreacion: '2026-03-10T15:30:00Z',
    nombreProyecto: 'Sistema de riego',
    nombreDocumento: 'Acta de inicio',
    versionDocumento: 1,
    nombreRepositorio: 'Repositorio base',
    nombreAsesor: 'Marta Gómez',
    revisionAsesor: null,
    estadoRevision: null,
    nombreEstadoRevision: null,
    fechaCreacionRevision: null,
    ...parcial,
  };
}

function pagina(content: VersionArtefacto[]): Page<VersionArtefacto> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    page: 0,
    size: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('usePuedeRegistrarRevision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getIds.mockResolvedValue(['a-omitido']);
  });

  it('cierra mientras carga y luego abre solo en la última versión elegible de un artefacto no omitido', async () => {
    // Arrange
    const ultima = version({});
    const anterior = version({ id: 'v-1', version: 1, estadoRevision: 'RESUELTA' });
    const pendiente = version({ id: 'v-3', artefacto: 'a-3', estadoRevision: 'PENDIENTE' });
    const omitida = version({ id: 'v-2', artefacto: 'a-omitido' });
    consultar.mockResolvedValue(pagina([ultima, anterior]));

    // Act
    const { result } = renderHook(() =>
      usePuedeRegistrarRevision([ultima, anterior, pendiente, omitida]),
    );

    // Assert
    expect(result.current.puedeRegistrar(ultima)).toBe(false);
    await waitFor(() => expect(result.current.puedeRegistrar(ultima)).toBe(true));
    expect(result.current.puedeRegistrar(anterior)).toBe(false);
    expect(result.current.puedeRegistrar(pendiente)).toBe(false);
    expect(result.current.puedeRegistrar(omitida)).toBe(false);
  });

  it('no abre cuando la revisión de la versión anterior sigue en progreso', async () => {
    // Arrange
    const tercera = version({ version: 3 });
    const segunda = version({ id: 'v-1', version: 2, estadoRevision: 'EN_PROGRESO' });
    consultar.mockResolvedValue(pagina([tercera, segunda]));

    // Act
    const { result } = renderHook(() => usePuedeRegistrarRevision([tercera]));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalled());
    await waitFor(() => expect(result.current.puedeRegistrar(tercera)).toBe(false));
  });

  it('si falla el catálogo de omitidos no ofrece la acción ni consulta la última versión', async () => {
    // Arrange
    const ultima = version({});
    getIds.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => usePuedeRegistrarRevision([ultima]));

    // Assert
    await waitFor(() => expect(getIds).toHaveBeenCalled());
    expect(result.current.puedeRegistrar(ultima)).toBe(false);
    expect(consultar).not.toHaveBeenCalled();
  });
});
