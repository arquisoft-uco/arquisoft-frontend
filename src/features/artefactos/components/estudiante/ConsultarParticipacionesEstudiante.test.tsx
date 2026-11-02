import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import type { Page } from '../../../../shared/models/api-response';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import ConsultarParticipacionesEstudiante from './ConsultarParticipacionesEstudiante';

vi.mock('../../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    getParticipacionesEstudiante: vi.fn(),
    consultarVersionesArtefactoEstudiante: vi.fn(),
  },
}));

const getParticipaciones = vi.mocked(artefactosService.getParticipacionesEstudiante);
const consultarVersiones = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);

function paginaCon(versiones: VersionArtefacto[]): Page<VersionArtefacto> {
  return {
    content: versiones,
    totalElements: versiones.length,
    totalPages: 1,
    page: 0,
    size: 1,
    first: true,
    last: true,
    empty: versiones.length === 0,
  };
}

function ultima(artefacto: string, estadoRevision: string | null): VersionArtefacto {
  return {
    id: `v-${artefacto}`,
    artefacto,
    version: 3,
    fechaCreacion: '2026-03-10T15:30:00Z',
    nombreProyecto: 'Sistema de riego',
    nombreDocumento: 'Documento',
    versionDocumento: 2,
    nombreRepositorio: 'Repositorio base',
    nombreAsesor: 'Laura Gómez',
    revisionAsesor: estadoRevision ? `r-${artefacto}` : null,
    estadoRevision,
    nombreEstadoRevision: estadoRevision,
    fechaCreacionRevision: null,
  };
}

function simularUltimas(porArtefacto: Record<string, VersionArtefacto>) {
  consultarVersiones.mockImplementation(({ filtros }) => {
    const pedido = JSON.stringify(filtros);
    const id = Object.keys(porArtefacto).find((a) => pedido.includes(a));
    return Promise.resolve(paginaCon(id ? [porArtefacto[id]] : []));
  });
}

function participacion(
  id: string,
  proyectoGrado: string,
  nombreProyecto: string,
  nombreDocumento: string,
): ParticipacionArtefacto {
  return {
    id,
    proyectoGrado,
    nombreProyecto,
    nombreDocumento,
    versionRepositorioArtefacto: `v-${id}`,
    versionDocumento: 2,
    nombreRepositorio: 'Repositorio base',
    asesor: 'u-1',
    nombreAsesor: 'Laura Gómez',
    omitido: false,
  };
}

async function abrirMenu(user: ReturnType<typeof userEvent.setup>, documento: string) {
  const tabla = await screen.findByRole('table', {
    name: 'Artefactos del proyecto Sistema de riego',
  });
  await user.click(await within(tabla).findByRole('button', { name: `Acciones de ${documento}` }));
}

describe('ConsultarParticipacionesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultarVersiones.mockResolvedValue(paginaCon([]));
  });

  it('el nombre del documento es texto: la acción sale del menú de la fila', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
    ]);
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);
    await abrirMenu(user, 'Acta de inicio');

    // Assert
    expect(
      screen.queryByRole('button', { name: /Subir nueva versión de/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Gestionar revisión' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Ver versiones' })).toBeInTheDocument();
  });

  it('ofrece Subir nueva versión solo cuando la última versión lo permite y muestra el motivo si no', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Sin revisión'),
      participacion('a-2', 'p-1', 'Sistema de riego', 'Pendiente'),
      participacion('a-3', 'p-1', 'Sistema de riego', 'Cerrado'),
      participacion('a-4', 'p-1', 'Sistema de riego', 'En progreso'),
      participacion('a-5', 'p-1', 'Sistema de riego', 'Sin versiones'),
    ]);
    simularUltimas({
      'a-1': ultima('a-1', null),
      'a-2': ultima('a-2', 'PENDIENTE'),
      'a-3': ultima('a-3', 'CERRADA'),
      'a-4': ultima('a-4', 'EN_PROGRESO'),
    });
    const user = userEvent.setup();
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });
    expect(await within(tabla).findByText('El asesor cerró este artefacto.')).toBeInTheDocument();

    // Assert
    expect(within(tabla).getByText('Esperando la revisión del asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('El asesor está preparando la revisión.')).toBeInTheDocument();

    // Act
    await abrirMenu(user, 'En progreso');

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Subir nueva versión' })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');
    await abrirMenu(user, 'Sin versiones');

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Subir nueva versión' })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');
    await abrirMenu(user, 'Cerrado');

    // Assert
    expect(screen.queryByRole('menuitem', { name: 'Subir nueva versión' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Ver versiones' })).toBeInTheDocument();
  });

  it('si falla la consulta de la última versión deja ofrecer la subida y el servidor decide', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
    ]);
    consultarVersiones.mockRejectedValue(new Error('falla'));
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);
    await abrirMenu(user, 'Acta de inicio');

    // Assert
    expect(
      await screen.findByRole('menuitem', { name: 'Subir nueva versión' }),
    ).toBeInTheDocument();
  });

  it('con datos muestra un título por proyecto, sus documentos y el resumen', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
      participacion('a-2', 'p-1', 'Sistema de riego', 'Anteproyecto'),
      participacion('a-3', 'p-2', 'Domótica', 'Acta de inicio'),
    ]);

    // Act
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);

    // Assert
    expect(await screen.findByText('3 artefactos en 2 proyectos')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Sistema de riego' })).toBeInTheDocument();
    expect(screen.getByText('Domótica')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Artefactos del proyecto Sistema de riego' });
    expect(within(tabla).getByRole('columnheader', { name: 'Asesor' })).toBeInTheDocument();
    expect(within(tabla).getAllByText('Laura Gómez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Laura Gómez · Versión 2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Anteproyecto').length).toBeGreaterThan(0);
  });

  it('Gestionar revisión abre el panel del artefacto y Cerrar lo cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
    ]);
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);

    // Act
    await abrirMenu(user, 'Acta de inicio');
    await user.click(screen.getByRole('menuitem', { name: 'Gestionar revisión' }));

    // Assert
    const panel = await screen.findByRole('dialog');
    expect(await within(panel).findByText('Aún no has subido versiones')).toBeInTheDocument();
    await user.click(within(panel).getByRole('button', { name: 'Cerrar panel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Subir nueva versión abre directamente el panel de subida', async () => {
    // Arrange
    const user = userEvent.setup();
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
    ]);
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);

    // Act
    await abrirMenu(user, 'Acta de inicio');
    await user.click(await screen.findByRole('menuitem', { name: 'Subir nueva versión' }));

    // Assert
    const panel = await screen.findByRole('dialog');
    expect(within(panel).getByText('Acta de inicio')).toBeInTheDocument();
    expect(within(panel).getByText('Sistema de riego')).toBeInTheDocument();
  });

  it('Ver versiones avisa con el id del artefacto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onVerVersiones = vi.fn();
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
    ]);
    render(<ConsultarParticipacionesEstudiante onVerVersiones={onVerVersiones} />);

    // Act
    await abrirMenu(user, 'Acta de inicio');
    await user.click(screen.getByRole('menuitem', { name: 'Ver versiones' }));

    // Assert
    expect(onVerVersiones).toHaveBeenCalledWith('a-1');
  });

  it('una participación omitida lleva "Omitido" y no tiene menú', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      { ...participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'), omitido: true },
      participacion('a-2', 'p-1', 'Sistema de riego', 'Anteproyecto'),
    ]);
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });

    // Assert
    expect(
      await within(tabla).findByRole('button', { name: 'Acciones de Anteproyecto' }),
    ).toBeInTheDocument();
    expect(
      within(tabla).queryByRole('button', { name: 'Acciones de Acta de inicio' }),
    ).not.toBeInTheDocument();
    expect(within(tabla).getByText('Omitido')).toBeInTheDocument();
  });

  it('muestra el estado de carga mientras llega la lista', () => {
    // Arrange
    getParticipaciones.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin participaciones muestra el estado vacío', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([]);

    // Act
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);

    // Assert
    expect(await screen.findByText('Aún no participas en artefactos')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    getParticipaciones.mockRejectedValue(new Error('falla'));
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante onVerVersiones={vi.fn()} />);
    const aviso = await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(aviso).toHaveTextContent('No se pudo cargar tu participación');
    await waitFor(() => expect(getParticipaciones).toHaveBeenCalledTimes(2));
  });
});
