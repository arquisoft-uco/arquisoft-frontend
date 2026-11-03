import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import ConsultarVersionesArtefactoEstudiante from './ConsultarVersionesArtefactoEstudiante';
vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar: vi.fn(), descargando: false }),
}));

vi.mock('../../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesArtefactoEstudiante: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
    getVersionArtefacto: vi.fn(),
    getObservacionesRevisionEstudiante: vi.fn(),
    eliminarVersionArtefacto: vi.fn(),
  },
}));

const getVersion = vi.mocked(artefactosService.getVersionArtefacto);
const getObservaciones = vi.mocked(artefactosService.getObservacionesRevisionEstudiante);
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
  fechaCreacionRevision: null,
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

  it('muestra las versiones sin revisión con el resumen de columnas del estudiante y la búsqueda habilitada', async () => {
    // Arrange
    consultarVersiones.mockResolvedValue(pagina([VERSION]));

    // Act
    render(<ConsultarVersionesArtefactoEstudiante />);

    // Assert
    const tabla = within(await screen.findByRole('table', { name: 'Versiones de artefactos' }));
    expect(await tabla.findByText('Acta de inicio')).toBeInTheDocument();
    expect(tabla.getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla.getByText('Versión 2 del documento')).toBeInTheDocument();
    expect(tabla.getByText('Versión 4')).toBeInTheDocument();
    expect(tabla.getByText('Sin revisión')).toBeInTheDocument();
    expect(tabla.queryByRole('columnheader', { name: 'Repositorio' })).not.toBeInTheDocument();
    expect(tabla.queryByRole('columnheader', { name: 'Asesor' })).not.toBeInTheDocument();
    expect(tabla.getByRole('columnheader', { name: /Fecha de subida/ })).toBeInTheDocument();
    expect(tabla.getByText('—')).toBeInTheDocument();
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

  describe('eliminar versión', () => {
    const ANTERIOR: VersionArtefacto = {
      ...VERSION,
      id: 'v-0',
      version: 3,
      revisionAsesor: 'r-0',
      estadoRevision: 'EN_PROGRESO',
      nombreEstadoRevision: 'En progreso',
      fechaCreacionRevision: '2026-03-09T10:00:00Z',
    };

    function simularListado(fila: VersionArtefacto, ultimas: VersionArtefacto[]) {
      consultarVersiones.mockImplementation((req) =>
        Promise.resolve(pagina(req.tamanio === 2 ? ultimas : [fila])),
      );
    }

    async function abrirMenu(user: UserEvent) {
      const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
      await user.click(
        await within(tabla).findByRole('button', {
          name: 'Acciones de la versión 4 de Acta de inicio',
        }),
      );
    }

    it('ofrece "Eliminar" en la última versión sin revisión y abre la confirmación', async () => {
      // Arrange
      const user = userEvent.setup();
      simularListado(VERSION, [VERSION, ANTERIOR]);
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user);
      await user.click(await screen.findByRole('menuitem', { name: 'Eliminar' }));

      // Assert
      expect(await screen.findByRole('alertdialog')).toHaveTextContent(
        '¿Eliminar la versión 4 de «Acta de inicio»?',
      );
    });

    it('no la ofrece si no es la última o si la revisión anterior no está en progreso', async () => {
      // Arrange
      const user = userEvent.setup();
      simularListado(VERSION, [{ ...VERSION, id: 'v-9', version: 5 }, VERSION]);
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user);

      // Assert
      await waitFor(() => expect(consultarVersiones).toHaveBeenCalledTimes(2));
      expect(screen.getByRole('menuitem', { name: 'Descargar' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Eliminar' })).not.toBeInTheDocument();
    });
  });

  describe('gestión de la revisión', () => {
    const EN_PROGRESO: VersionArtefacto = {
      ...VERSION,
      revisionAsesor: 'r-1',
      estadoRevision: 'EN_PROGRESO',
      nombreEstadoRevision: 'En progreso',
      fechaCreacionRevision: '2026-03-12T10:00:00Z',
    };
    const RESUELTA: VersionArtefacto = {
      ...VERSION,
      id: 'v-2',
      version: 5,
      revisionAsesor: 'r-2',
      estadoRevision: 'RESUELTA',
      nombreEstadoRevision: 'Resuelta',
      fechaCreacionRevision: '2026-03-13T10:00:00Z',
    };

    async function abrirMenu(user: UserEvent, version: number) {
      const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
      await user.click(
        await within(tabla).findByRole('button', {
          name: `Acciones de la versión ${version} de Acta de inicio`,
        }),
      );
    }

    it('ofrece una sola acción de revisión: Gestionar si está en progreso, Ver si no', async () => {
      // Arrange
      const user = userEvent.setup();
      consultarVersiones.mockResolvedValue(pagina([EN_PROGRESO, RESUELTA]));
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user, 4);

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Gestionar revisión' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Ver observaciones' })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Marcar como resuelta' }),
      ).not.toBeInTheDocument();

      // Act
      await user.keyboard('{Escape}');
      await abrirMenu(user, 5);

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver revisión' })).toBeInTheDocument();
    });

    it('ofrece "Subir nueva versión" solo en progreso y abre el panel de subida', async () => {
      // Arrange
      const user = userEvent.setup();
      consultarVersiones.mockResolvedValue(pagina([EN_PROGRESO, RESUELTA]));
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user, 5);

      // Assert
      expect(
        screen.queryByRole('menuitem', { name: 'Subir nueva versión' }),
      ).not.toBeInTheDocument();

      // Act
      await user.keyboard('{Escape}');
      await abrirMenu(user, 4);
      await user.click(screen.getByRole('menuitem', { name: 'Subir nueva versión' }));

      // Assert
      expect(await screen.findByRole('dialog', { name: /versión/i })).toBeInTheDocument();
    });

    it('no la ofrece sin revisión ni con la revisión pendiente', async () => {
      // Arrange
      const user = userEvent.setup();
      const pendiente: VersionArtefacto = {
        ...EN_PROGRESO,
        id: 'v-3',
        version: 6,
        estadoRevision: 'PENDIENTE',
      };
      consultarVersiones.mockResolvedValue(pagina([VERSION, pendiente]));
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user, 4);

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Descargar' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /revisión/ })).not.toBeInTheDocument();

      // Act
      await user.keyboard('{Escape}');
      await abrirMenu(user, 6);

      // Assert
      expect(screen.queryByRole('menuitem', { name: /revisión/ })).not.toBeInTheDocument();
    });

    it('abre el panel con las observaciones de la revisión: editable en progreso, solo lectura si no', async () => {
      // Arrange
      const user = userEvent.setup();
      getObservaciones.mockResolvedValue([
        {
          id: 'o-1',
          revisionAsesorId: 'r-1',
          descripcion: 'Falta el diagrama',
          estadoId: 'NUEVA',
          estadoNombre: 'Nueva',
        },
      ]);
      consultarVersiones.mockResolvedValue(pagina([EN_PROGRESO, RESUELTA]));
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user, 4);
      await user.click(screen.getByRole('menuitem', { name: 'Gestionar revisión' }));

      // Assert
      expect(await screen.findByRole('checkbox')).toBeInTheDocument();
      expect(getObservaciones).toHaveBeenCalledWith('r-1');
      expect(screen.getByRole('button', { name: 'Marcar como resuelta' })).toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('button', { name: 'Cerrar' }));
      await abrirMenu(user, 5);
      await user.click(screen.getByRole('menuitem', { name: 'Ver revisión' }));

      // Assert
      expect(await screen.findByText('Falta el diagrama')).toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Marcar como resuelta' }),
      ).not.toBeInTheDocument();
    });
  });
});
