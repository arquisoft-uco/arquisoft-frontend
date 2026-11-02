import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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
    getObservacionesRevisionEstudiante: vi.fn(),
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

  describe('observaciones de la revisión (HU-134)', () => {
    const REVISADA: VersionArtefacto = {
      ...VERSION,
      revisionAsesor: 'r-7',
      estadoRevision: 'EN_PROGRESO',
      nombreEstadoRevision: 'En progreso',
    };

    async function abrirMenu(user: UserEvent) {
      const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
      await user.click(
        await within(tabla).findByRole('button', {
          name: 'Acciones de la versión 4 de Acta de inicio',
        }),
      );
    }

    it('con la revisión enviada ofrece "Ver observaciones" y abre el panel con el id de la revisión', async () => {
      // Arrange
      const user = userEvent.setup();
      consultarVersiones.mockResolvedValue(pagina([REVISADA]));
      getObservaciones.mockResolvedValue([]);
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user);
      await user.click(screen.getByRole('menuitem', { name: 'Ver observaciones' }));

      // Assert
      expect(await screen.findByText(/Tu asesor aún no ha registrado/)).toBeInTheDocument();
      expect(getObservaciones).toHaveBeenCalledWith('r-7');
    });

    it('no la ofrece sin revisión ni con la revisión pendiente', async () => {
      // Arrange
      const user = userEvent.setup();
      const pendiente: VersionArtefacto = {
        ...REVISADA,
        id: 'v-2',
        nombreDocumento: 'Plano',
        estadoRevision: 'PENDIENTE',
      };
      consultarVersiones.mockResolvedValue(pagina([VERSION, pendiente]));
      render(<ConsultarVersionesArtefactoEstudiante />);

      // Act
      await abrirMenu(user);

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Ver observaciones' })).not.toBeInTheDocument();

      // Act
      await user.keyboard('{Escape}');
      const tabla = screen.getByRole('table', { name: 'Versiones de artefactos' });
      await user.click(
        within(tabla).getByRole('button', { name: 'Acciones de la versión 4 de Plano' }),
      );

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: 'Ver observaciones' })).not.toBeInTheDocument();
    });
  });

  it('ofrece "Marcar como resuelta" solo en filas EN_PROGRESO y abre el diálogo de confirmación', async () => {
    // Arrange
    const user = userEvent.setup();
    consultarVersiones.mockResolvedValue(
      pagina([
        {
          ...VERSION,
          revisionAsesor: 'r-1',
          estadoRevision: 'EN_PROGRESO',
          nombreEstadoRevision: 'En progreso',
        },
        {
          ...VERSION,
          id: 'v-2',
          version: 5,
          revisionAsesor: 'r-2',
          estadoRevision: 'RESUELTA',
          nombreEstadoRevision: 'Resuelta',
        },
      ]),
    );
    render(<ConsultarVersionesArtefactoEstudiante />);
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', {
        name: 'Acciones de la versión 5 de Acta de inicio',
      }),
    );

    // Assert
    expect(
      screen.queryByRole('menuitem', { name: 'Marcar como resuelta' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');

    // Act
    await user.click(
      within(tabla).getByRole('button', { name: 'Acciones de la versión 4 de Acta de inicio' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Marcar como resuelta' }));

    // Assert
    expect(await screen.findByText('¿Marcar la revisión como resuelta?')).toBeInTheDocument();
  });

  it('el panel de observaciones es editable solo desde una fila con revisión EN_PROGRESO', async () => {
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
    consultarVersiones.mockResolvedValue(
      pagina([
        {
          ...VERSION,
          revisionAsesor: 'r-1',
          estadoRevision: 'EN_PROGRESO',
          nombreEstadoRevision: 'En progreso',
        },
        {
          ...VERSION,
          id: 'v-2',
          version: 5,
          revisionAsesor: 'r-2',
          estadoRevision: 'RESUELTA',
          nombreEstadoRevision: 'Resuelta',
        },
      ]),
    );
    render(<ConsultarVersionesArtefactoEstudiante />);
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', {
        name: 'Acciones de la versión 4 de Acta de inicio',
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver observaciones' }));

    // Assert
    expect(await screen.findByRole('checkbox')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    await user.click(
      within(tabla).getByRole('button', { name: 'Acciones de la versión 5 de Acta de inicio' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver observaciones' }));

    // Assert
    expect(await screen.findByText('Falta el diagrama')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
