import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import MisArtefactosEstudiante from './MisArtefactosEstudiante';

vi.mock('../../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    getParticipacionesEstudiante: vi.fn(),
    consultarVersionesArtefactoEstudiante: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
  },
}));

const ID_ARTEFACTO = '3f2b8c1e-5d4a-4b6c-9e7f-1a2b3c4d5e6f';

const PARTICIPACION: ParticipacionArtefacto = {
  id: ID_ARTEFACTO,
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionRepositorioArtefacto: 'vr-1',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  asesor: 'u-1',
  nombreAsesor: 'Laura Gómez',
  omitido: false,
};

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: ID_ARTEFACTO,
  version: 1,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Laura Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
  fechaCreacionRevision: null,
};

const PAGINA: Page<VersionArtefacto> = {
  content: [VERSION],
  totalElements: 1,
  totalPages: 1,
  page: 0,
  size: 10,
  first: true,
  last: true,
  empty: false,
};

describe('MisArtefactosEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(artefactosService.getParticipacionesEstudiante).mockResolvedValue([PARTICIPACION]);
    vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante).mockResolvedValue(PAGINA);
    vi.mocked(artefactosService.getEstadosRevisionAsesor).mockResolvedValue([]);
  });

  it('Ver versiones filtra la sección de versiones por el artefacto y el chip la vuelve a todas', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<MisArtefactosEstudiante />);
    const tablaArtefactos = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });

    // Act
    await user.click(
      await within(tablaArtefactos).findByRole('button', { name: 'Acciones de Acta de inicio' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver versiones' }));

    // Assert
    const quitar = await screen.findByRole('button', {
      name: 'Quitar filtro Artefacto: Acta de inicio',
    });
    await waitFor(() => {
      const ultimaConsulta = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante).mock
        .lastCall;
      expect(JSON.stringify(ultimaConsulta)).toContain(ID_ARTEFACTO);
    });

    // Act
    await user.click(quitar);

    // Assert
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Quitar filtro Artefacto: Acta de inicio' }),
      ).not.toBeInTheDocument(),
    );
  });
});
