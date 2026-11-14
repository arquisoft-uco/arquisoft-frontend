import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { artefactosService } from '../services/artefactosService';
import { useRevisionEnProgresoReciente } from './useRevisionEnProgresoReciente';

vi.mock('../services/artefactosService', () => ({
  artefactosService: { consultarVersionesArtefactoEstudiante: vi.fn() },
}));

const consultar = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 2,
  fechaCreacion: '2026-03-01T10:00:00',
  nombreProyecto: 'Proyecto',
  nombreDocumento: 'Documento',
  versionDocumento: 3,
  nombreRepositorio: 'Repo',
  nombreAsesor: 'Asesor',
  revisionAsesor: 'r-1',
  estadoRevision: 'EN_PROGRESO',
  nombreEstadoRevision: 'En progreso',
  fechaCreacionRevision: '2026-03-02T10:00:00',
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

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

describe('useRevisionEnProgresoReciente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pide la versión más alta con revisión en progreso del artefacto y la expone como gestionable', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([VERSION]));

    // Act
    const { result } = renderHook(() => useRevisionEnProgresoReciente('a-1', true));

    // Assert
    await waitFor(() => expect(result.current.revision).toMatchObject({ id: 'r-1', version: 2 }));
    expect(result.current.revision).toMatchObject({ estadoId: 'EN_PROGRESO', artefactoId: 'a-1' });
    expect(consultar).toHaveBeenCalledTimes(1);
    expect(consultar).toHaveBeenCalledWith(
      expect.objectContaining({ pagina: 0, tamanio: 1, ordenamiento: ['version:DESC'] }),
    );
    const filtros = JSON.stringify(consultar.mock.calls[0][0].filtros);
    expect(filtros).toContain('a-1');
    expect(filtros).toContain('EN_PROGRESO');
  });

  it('sin resultados devuelve null y deshabilitado no consulta', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    const { result } = renderHook(() => useRevisionEnProgresoReciente('a-1', true));
    const apagado = renderHook(() => useRevisionEnProgresoReciente('a-2', false));

    // Assert
    await waitFor(() => expect(result.current.revision).toBeNull());
    expect(apagado.result.current.revision).toBeUndefined();
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it('expone el error cuando la consulta falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo'));

    // Act
    const { result } = renderHook(() => useRevisionEnProgresoReciente('a-1', true));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.revision).toBeUndefined();
  });
});
