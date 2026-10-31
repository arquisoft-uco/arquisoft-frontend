import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import ConsultarVersionesArtefactoEstudiante from './ConsultarVersionesArtefactoEstudiante';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesArtefactoEstudiante: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
    getVersionArtefacto: vi.fn(),
  },
}));

const getVersion = vi.mocked(artefactosService.getVersionArtefacto);
const getEstados = vi.mocked(artefactosService.getEstadosRevisionAsesor);

const consultarVersiones = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
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

describe('ConsultarVersionesArtefactoEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEstados.mockResolvedValue([]);
  });

  it('muestra proyecto, documento, repositorio y la columna Asesor, con la búsqueda habilitada', async () => {
    // Arrange
    consultarVersiones.mockResolvedValue(pagina([VERSION]));

    // Act
    render(<ConsultarVersionesArtefactoEstudiante />);

    // Assert
    const tabla = within(await screen.findByRole('table', { name: 'Versiones de artefactos' }));
    expect(await tabla.findByText('Acta de inicio')).toBeInTheDocument();
    expect(tabla.getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla.getByText('Versión 2 del documento')).toBeInTheDocument();
    expect(tabla.getByText('Repositorio base')).toBeInTheDocument();
    expect(tabla.getByRole('columnheader', { name: 'Asesor' })).toBeInTheDocument();
    expect(tabla.getByText('Marta Gómez')).toBeInTheDocument();
    expect(tabla.getByText('Versión 4')).toBeInTheDocument();
    expect(screen.getByText('1 versión')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar artefactos' })).toBeEnabled();
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

  it('muestra el estado de revisión de la versión y los chips del catálogo', async () => {
    // Arrange
    getEstados.mockResolvedValue([{ id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' }]);
    consultarVersiones.mockResolvedValue(
      pagina([
        {
          ...VERSION,
          revisionAsesor: 'r-1',
          estadoRevision: 'PENDIENTE',
          nombreEstadoRevision: 'Pendiente',
        },
      ]),
    );

    // Act
    render(<ConsultarVersionesArtefactoEstudiante />);

    // Assert
    const tabla = within(await screen.findByRole('table', { name: 'Versiones de artefactos' }));
    expect(await tabla.findByText('Pendiente')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Sin revisión' })).toBeInTheDocument();
  });

  it('"Ver información" abre el panel con los datos de la versión y cerrarlo conserva la lista', async () => {
    // Arrange
    const user = userEvent.setup();
    consultarVersiones.mockResolvedValue(pagina([VERSION]));
    getVersion.mockResolvedValue({ ...VERSION, uriArchivo: 'almacen/acta-v4.pdf' });
    render(<ConsultarVersionesArtefactoEstudiante />);
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', {
        name: 'Acciones de la versión 4 de Acta de inicio',
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver información' }));

    // Assert
    expect(await screen.findByText('almacen/acta-v4.pdf')).toBeInTheDocument();
    expect(getVersion).toHaveBeenCalledWith('v-1');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(screen.queryByText('almacen/acta-v4.pdf')).not.toBeInTheDocument());
    expect(screen.getByRole('table', { name: 'Versiones de artefactos' })).toBeInTheDocument();
  });
});
