import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { ArtefactoEstudiante } from '../../models/ArtefactoEstudiante';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import ConsultarVersionesArtefactoEstudiante from './ConsultarVersionesArtefactoEstudiante';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesArtefactoEstudiante: vi.fn(),
    consultarArtefactosEstudiante: vi.fn(),
  },
}));

const consultarVersiones = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);
const consultarArtefactos = vi.mocked(artefactosService.consultarArtefactosEstudiante);

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
};

const ARTEFACTO = {
  id: 'a-1',
  nombreDocumento: 'Acta de inicio',
  nombreProyecto: 'Sistema de riego',
} as ArtefactoEstudiante;

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

describe('ConsultarVersionesArtefactoEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultarArtefactos.mockResolvedValue(pagina([ARTEFACTO]));
  });

  it('muestra las versiones con el nombre del artefacto resuelto por el catálogo', async () => {
    // Arrange
    consultarVersiones.mockResolvedValue(pagina([VERSION]));

    // Act
    render(<ConsultarVersionesArtefactoEstudiante />);

    // Assert
    const tabla = within(await screen.findByRole('table', { name: 'Versiones de artefactos' }));
    expect(await tabla.findByText('Acta de inicio')).toBeInTheDocument();
    expect(tabla.getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla.getByText('Versión 4')).toBeInTheDocument();
    expect(screen.getByText('1 versión')).toBeInTheDocument();
  });

  it('sin versiones muestra el vacío con el texto del estudiante', async () => {
    // Arrange
    consultarVersiones.mockResolvedValue(pagina<VersionArtefacto>([]));

    // Act
    render(<ConsultarVersionesArtefactoEstudiante />);

    // Assert
    expect(await screen.findByText('Aún no hay versiones de artefactos')).toBeInTheDocument();
    expect(screen.getByText(/uno de tus artefactos/)).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    consultarVersiones.mockRejectedValue(new Error('falla'));
    const user = userEvent.setup();

    // Act
    render(<ConsultarVersionesArtefactoEstudiante />);
    const aviso = await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(aviso).toHaveTextContent('No se pudieron cargar las versiones');
    await waitFor(() => expect(consultarVersiones).toHaveBeenCalledTimes(2));
  });

  it('si el catálogo falla avisa y deshabilita la búsqueda sin bloquear el listado', async () => {
    // Arrange
    consultarArtefactos.mockRejectedValue(new Error('falla'));
    consultarVersiones.mockResolvedValue(pagina([VERSION]));

    // Act
    render(<ConsultarVersionesArtefactoEstudiante />);

    // Assert
    expect(
      await screen.findByText(/La búsqueda por nombre no está disponible/),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar artefactos' })).toBeDisabled();
    expect(await screen.findByText('Versión 4')).toBeInTheDocument();
  });
});
