import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { RevisionAsesorEstudiante } from '../../models/RevisionAsesorEstudiante';
import { artefactosService } from '../../services/artefactosService';
import ConsultarRevisionesEstudiante from './ConsultarRevisionesEstudiante';

vi.mock('../../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));
vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarRevisionesEstudiante: vi.fn(),
    consultarVersionesArtefactoEstudiante: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
    getObservacionesRevisionEstudiante: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarRevisionesEstudiante);
const getObservaciones = vi.mocked(artefactosService.getObservacionesRevisionEstudiante);
const consultarVersiones = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);

const REVISION: RevisionAsesorEstudiante = {
  id: 'r-1',
  versionArtefacto: 'v-1',
  artefacto: 'a-1',
  version: 3,
  estadoRevisionAsesor: 'EN_PROGRESO',
  estadoRevisionAsesorNombre: 'En progreso',
  fechaCreacion: '2026-04-02T09:00:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  observacionesAbiertas: 2,
  totalObservaciones: 5,
};

function pagina<T>(content: T[]): Page<T> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    page: 0,
    size: 10,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('ConsultarRevisionesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(artefactosService.getEstadosRevisionAsesor).mockResolvedValue([]);
    consultarVersiones.mockResolvedValue(pagina([]));
    getObservaciones.mockResolvedValue([]);
  });

  it('lista la revisión con documento, proyecto, versión, estado y observaciones abiertas', async () => {
    // Arrange
    consultar.mockResolvedValue(
      pagina([
        REVISION,
        {
          ...REVISION,
          id: 'r-2',
          estadoRevisionAsesor: 'RESUELTA',
          estadoRevisionAsesorNombre: 'Resuelta',
          observacionesAbiertas: 0,
          totalObservaciones: 0,
        },
      ]),
    );

    // Act
    render(<ConsultarRevisionesEstudiante />);

    // Assert
    const tabla = within(await screen.findByRole('table', { name: 'Revisiones de artefactos' }));
    expect((await tabla.findAllByText('Acta de inicio')).length).toBe(2);
    expect(tabla.getAllByText('Sistema de riego')).toHaveLength(2);
    expect(tabla.getByText('En progreso')).toBeInTheDocument();
    expect(tabla.getByText('2 de 5 abiertas')).toBeInTheDocument();
    expect(tabla.getByText('Sin observaciones')).toBeInTheDocument();
    expect(screen.getByText('2 revisiones')).toBeInTheDocument();
  });

  it('sin revisiones y sin filtros muestra el vacío con el siguiente paso', async () => {
    // Arrange
    consultar.mockResolvedValue(pagina([]));

    // Act
    render(<ConsultarRevisionesEstudiante />);

    // Assert
    expect(await screen.findByText('Aún no tienes revisiones')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cuando tu asesor envíe una revisión de uno de tus artefactos, la verás aquí.',
      ),
    ).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValueOnce(new Error('Sin conexión'));
    consultar.mockResolvedValue(pagina([REVISION]));

    // Act
    render(<ConsultarRevisionesEstudiante />);
    await user.click(await screen.findByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(
      await screen.findByRole('table', { name: 'Revisiones de artefactos' }),
    ).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('Gestionar revisión abre el panel con las observaciones de esa revisión', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue(pagina([REVISION]));
    render(<ConsultarRevisionesEstudiante />);
    const tabla = await screen.findByRole('table', { name: 'Revisiones de artefactos' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', {
        name: 'Acciones de la revisión de la versión 3 de Acta de inicio',
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Gestionar revisión' }));

    // Assert
    expect(await screen.findByRole('heading', { name: 'Gestionar revisión' })).toBeInTheDocument();
    expect(getObservaciones).toHaveBeenCalledWith('r-1');
  });
});
