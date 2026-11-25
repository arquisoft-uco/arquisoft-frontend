import { describe, it, expect, vi, beforeEach } from 'vitest';

const { descargar } = vi.hoisted(() => ({ descargar: vi.fn() }));

vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar, descargando: false }),
}));
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import type { Page } from '../../../../shared/models/api-response';
import { artefactosService } from '../../services/artefactosService';
import ConsultarParticipacionesEstudiante from './ConsultarParticipacionesEstudiante';

vi.mock('../../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarParticipacionesEstudiante: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
    consultarVersionesArtefactoEstudiante: vi.fn(),
  },
}));

const consultarParticipaciones = vi.mocked(artefactosService.consultarParticipacionesEstudiante);
const getEstados = vi.mocked(artefactosService.getEstadosRevisionAsesor);
const consultarVersiones = vi.mocked(artefactosService.consultarVersionesArtefactoEstudiante);

function paginaCon(content: ParticipacionArtefacto[]): Page<ParticipacionArtefacto> {
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

function simularParticipaciones(content: ParticipacionArtefacto[]) {
  consultarParticipaciones.mockResolvedValue(paginaCon(content));
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
    proyectoFinalizado: false,
    proyectoCancelado: false,
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
    consultarVersiones.mockResolvedValue({ ...paginaCon([]), content: [] } as never);
    getEstados.mockResolvedValue([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'EN_PROGRESO', nombre: 'En progreso', descripcion: '' },
      { id: 'RESUELTA', nombre: 'Resuelta', descripcion: '' },
      { id: 'CERRADA', nombre: 'Cerrada', descripcion: '' },
    ]);
  });

  it('el nombre del documento es un enlace a sus versiones y las acciones salen del menú de la fila', async () => {
    // Arrange
    simularParticipaciones([participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio')]);
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante />);
    await abrirMenu(user, 'Acta de inicio');

    // Assert
    expect(
      screen.getAllByRole('link', { name: 'Ver versiones de Acta de inicio' })[0],
    ).toHaveAttribute('href', '/?vista=versiones-revisiones&artefacto=a-1');
    expect(
      screen.queryByRole('button', { name: /Subir nueva versión de/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Gestionar revisión' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Ver versiones' })).not.toBeInTheDocument();
  });

  it('ofrece Subir nueva versión según el estado de la última revisión de la fila y muestra el motivo si no', async () => {
    // Arrange
    simularParticipaciones([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Sin revisión'),
      {
        ...participacion('a-2', 'p-1', 'Sistema de riego', 'Pendiente'),
        estadoUltimaRevision: 'Pendiente',
      },
      {
        ...participacion('a-3', 'p-1', 'Sistema de riego', 'Cerrado'),
        estadoUltimaRevision: 'Cerrada',
      },
      {
        ...participacion('a-4', 'p-1', 'Sistema de riego', 'En progreso'),
        estadoUltimaRevision: 'En progreso',
      },
    ]);
    const user = userEvent.setup();
    render(<ConsultarParticipacionesEstudiante />);
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });
    expect(await within(tabla).findByText('El asesor cerró este artefacto.')).toBeInTheDocument();

    // Assert
    expect(within(tabla).getByText('El asesor está preparando la revisión.')).toBeInTheDocument();
    expect(
      within(tabla).getByText('Atiende las observaciones del asesor y sube una nueva versión.'),
    ).toBeInTheDocument();

    // Act
    await abrirMenu(user, 'En progreso');

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Subir nueva versión' })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');
    await abrirMenu(user, 'Sin revisión');

    // Assert
    expect(screen.getByRole('menuitem', { name: 'Subir nueva versión' })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');
    await abrirMenu(user, 'Cerrado');

    // Assert
    expect(screen.queryByRole('menuitem', { name: 'Subir nueva versión' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Ver versiones' })).not.toBeInTheDocument();
  });

  it('con datos muestra un título por proyecto, sus documentos y el resumen', async () => {
    // Arrange
    simularParticipaciones([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
      participacion('a-2', 'p-1', 'Sistema de riego', 'Anteproyecto'),
      participacion('a-3', 'p-2', 'Domótica', 'Acta de inicio'),
    ]);

    // Act
    render(<ConsultarParticipacionesEstudiante />);

    // Assert
    expect(await screen.findByText('3 artefactos')).toBeInTheDocument();
    expect(consultarVersiones).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { level: 2, name: 'Sistema de riego' })).toBeInTheDocument();
    expect(screen.getByText('Domótica')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Artefactos del proyecto Sistema de riego' });
    expect(within(tabla).getByRole('columnheader', { name: 'Asesor' })).toBeInTheDocument();
    expect(within(tabla).getAllByText('Laura Gómez').length).toBeGreaterThan(0);
    expect(
      (await screen.findAllByText('Laura Gómez · Versión 2 del documento')).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Anteproyecto').length).toBeGreaterThan(0);
  });

  it('Gestionar revisión abre el panel del artefacto y Cerrar lo cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    simularParticipaciones([participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio')]);
    render(<ConsultarParticipacionesEstudiante />);

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
    simularParticipaciones([participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio')]);
    render(<ConsultarParticipacionesEstudiante />);

    // Act
    await abrirMenu(user, 'Acta de inicio');
    await user.click(await screen.findByRole('menuitem', { name: 'Subir nueva versión' }));

    // Assert
    const panel = await screen.findByRole('dialog');
    expect(within(panel).getByText('Acta de inicio')).toBeInTheDocument();
    expect(within(panel).getByText('Sistema de riego')).toBeInTheDocument();
  });

  it('Descargar pide la versión del repositorio del artefacto, también en uno omitido, donde es la única acción', async () => {
    // Arrange
    const user = userEvent.setup();
    simularParticipaciones([
      { ...participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'), omitido: true },
      participacion('a-2', 'p-1', 'Sistema de riego', 'Anteproyecto'),
    ]);
    render(<ConsultarParticipacionesEstudiante />);

    // Act
    await abrirMenu(user, 'Acta de inicio');

    // Assert
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    await user.click(screen.getByRole('menuitem', { name: 'Descargar' }));
    expect(descargar).toHaveBeenCalledWith('v-a-1', 'Acta de inicio');
    const tabla = screen.getByRole('table', { name: 'Artefactos del proyecto Sistema de riego' });
    expect(within(tabla).getByText('Omitido')).toBeInTheDocument();
  });

  it('en un artefacto activo Descargar convive con las demás acciones', async () => {
    // Arrange
    const user = userEvent.setup();
    simularParticipaciones([participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio')]);
    render(<ConsultarParticipacionesEstudiante />);

    // Act
    await abrirMenu(user, 'Acta de inicio');

    // Assert
    expect(await screen.findByRole('menuitem', { name: 'Descargar' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Gestionar revisión' })).toBeInTheDocument();
  });

  it('muestra el estado de carga mientras llega la lista', () => {
    // Arrange
    consultarParticipaciones.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarParticipacionesEstudiante />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin participaciones muestra el estado vacío', async () => {
    // Arrange
    simularParticipaciones([]);

    // Act
    render(<ConsultarParticipacionesEstudiante />);

    // Assert
    expect(await screen.findByText('Aún no participas en artefactos')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    consultarParticipaciones.mockRejectedValue(new Error('falla'));
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante />);
    const aviso = await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(aviso).toHaveTextContent('No se pudo cargar tu participación');
    await waitFor(() => expect(consultarParticipaciones).toHaveBeenCalledTimes(2));
  });

  it('con el proyecto cancelado muestra su insignia y aviso, sin guía ni Subir nueva versión', async () => {
    // Arrange
    simularParticipaciones([
      {
        ...participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
        estadoUltimaRevision: 'En progreso',
        proyectoCancelado: true,
      },
    ]);
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante />);
    expect(await screen.findByText(/Este proyecto fue cancelado\./)).toBeInTheDocument();
    await abrirMenu(user, 'Acta de inicio');

    // Assert
    expect(screen.getByText('Proyecto cancelado')).toBeInTheDocument();
    expect(
      screen.queryByText('Atiende las observaciones del asesor y sube una nueva versión.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Subir nueva versión' })).not.toBeInTheDocument();
  });

  it('una revisión cerrada se distingue en la columna Última revisión sin abrir el artefacto', async () => {
    // Arrange
    simularParticipaciones([
      {
        ...participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
        estadoUltimaRevision: 'Cerrada',
      },
    ]);

    // Act
    render(<ConsultarParticipacionesEstudiante />);
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });

    // Assert
    expect(await within(tabla).findByText('Cerrada')).toBeInTheDocument();
  });

  it('con filtros y sin coincidencias muestra Sin resultados y Limpiar filtros quita el filtro', async () => {
    // Arrange
    simularParticipaciones([]);
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante />, { initialPath: '/?documento=zzz' });
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(await screen.findByText('Aún no participas en artefactos')).toBeInTheDocument();
    expect(screen.queryByText('Sin resultados')).not.toBeInTheDocument();
  });

  it('pide la página siguiente desde el paginador con el mismo orden por proyecto', async () => {
    // Arrange
    consultarParticipaciones.mockResolvedValue({
      ...paginaCon([participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio')]),
      totalElements: 25,
      totalPages: 3,
    });
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante />);
    expect(await screen.findByText('25 artefactos')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    await waitFor(() =>
      expect(consultarParticipaciones).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagina: 1,
          ordenamiento: ['nombreProyecto:ASC', 'nombreDocumento:ASC'],
        }),
      ),
    );
  });

  it('el chip Sin revisión filtra la consulta con el estado nulo', async () => {
    // Arrange
    simularParticipaciones([participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio')]);
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante />);
    await screen.findByText('1 artefacto');
    await user.click(screen.getByRole('button', { name: 'Sin revisión' }));

    // Assert
    await waitFor(() => expect(consultarParticipaciones).toHaveBeenCalledTimes(2));
    expect(JSON.stringify(consultarParticipaciones.mock.calls[1][0].filtros)).toContain(
      'estadoUltimaRevision',
    );
  });
});
