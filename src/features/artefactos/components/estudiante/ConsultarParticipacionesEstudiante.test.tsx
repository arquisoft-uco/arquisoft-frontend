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

describe('ConsultarParticipacionesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultarVersiones.mockResolvedValue(paginaCon([]));
  });

  it('muestra el motivo y no deja abrir la subida cuando la última versión lo bloquea', async () => {
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
    render(<ConsultarParticipacionesEstudiante />);
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });
    expect(
      await within(tabla).findByRole('button', { name: 'Subir nueva versión de En progreso' }),
    ).toBeInTheDocument();

    // Assert
    expect(
      within(tabla).getByRole('button', { name: 'Subir nueva versión de Sin versiones' }),
    ).toBeInTheDocument();
    expect(within(tabla).getByText('Esperando la revisión del asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('El asesor está preparando la revisión.')).toBeInTheDocument();
    expect(within(tabla).getByText('El asesor cerró este artefacto.')).toBeInTheDocument();
    for (const documento of ['Sin revisión', 'Pendiente', 'Cerrado']) {
      expect(
        within(tabla).queryByRole('button', { name: `Subir nueva versión de ${documento}` }),
      ).not.toBeInTheDocument();
    }
  });

  it('si falla la consulta de la última versión deja abrir la subida y el servidor decide', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
    ]);
    consultarVersiones.mockRejectedValue(new Error('falla'));

    // Act
    render(<ConsultarParticipacionesEstudiante />);

    // Assert
    const botones = await screen.findAllByRole('button', {
      name: 'Subir nueva versión de Acta de inicio',
    });
    expect(botones.length).toBeGreaterThan(0);
  });

  it('con datos muestra un título por proyecto, sus documentos y el resumen', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
      participacion('a-2', 'p-1', 'Sistema de riego', 'Anteproyecto'),
      participacion('a-3', 'p-2', 'Domótica', 'Acta de inicio'),
    ]);

    // Act
    render(<ConsultarParticipacionesEstudiante />);

    // Assert
    expect(await screen.findByText('3 artefactos en 2 proyectos')).toBeInTheDocument();
    expect(screen.getByText('Sistema de riego')).toBeInTheDocument();
    expect(screen.getByText('Domótica')).toBeInTheDocument();
    const tabla = screen.getByRole('table', { name: 'Artefactos del proyecto Sistema de riego' });
    expect(tabla).toBeInTheDocument();
    expect(within(tabla).getByRole('columnheader', { name: 'Asesor' })).toBeInTheDocument();
    expect(within(tabla).getAllByText('Laura Gómez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Laura Gómez · Versión 2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Anteproyecto').length).toBeGreaterThan(0);
  });

  it('al pulsar el nombre de un documento abre el panel para subir versión y Cerrar panel lo cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    getParticipaciones.mockResolvedValue([
      participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'),
    ]);
    render(<ConsultarParticipacionesEstudiante />);
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });

    // Act
    await user.click(
      within(tabla).getByRole('button', { name: 'Subir nueva versión de Acta de inicio' }),
    );

    // Assert
    const panel = await screen.findByRole('dialog');
    expect(within(panel).getByText('Acta de inicio')).toBeInTheDocument();
    expect(within(panel).getByText('Sistema de riego')).toBeInTheDocument();
    await user.click(within(panel).getByRole('button', { name: 'Cerrar panel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
  it('una participación omitida no abre el panel de subir versión y lleva "Omitido"', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([
      { ...participacion('a-1', 'p-1', 'Sistema de riego', 'Acta de inicio'), omitido: true },
      participacion('a-2', 'p-1', 'Sistema de riego', 'Anteproyecto'),
    ]);
    render(<ConsultarParticipacionesEstudiante />);
    const tabla = await screen.findByRole('table', {
      name: 'Artefactos del proyecto Sistema de riego',
    });

    // Assert
    expect(
      await within(tabla).findByRole('button', { name: 'Subir nueva versión de Anteproyecto' }),
    ).toBeInTheDocument();
    expect(
      within(tabla).queryByRole('button', { name: 'Subir nueva versión de Acta de inicio' }),
    ).toBeNull();
    expect(within(tabla).getByText('Omitido')).toBeInTheDocument();
  });

  it('muestra el estado de carga mientras llega la lista', () => {
    // Arrange
    getParticipaciones.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarParticipacionesEstudiante />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sin participaciones muestra el estado vacío', async () => {
    // Arrange
    getParticipaciones.mockResolvedValue([]);

    // Act
    render(<ConsultarParticipacionesEstudiante />);

    // Assert
    expect(await screen.findByText('Aún no participas en artefactos')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    getParticipaciones.mockRejectedValue(new Error('falla'));
    const user = userEvent.setup();

    // Act
    render(<ConsultarParticipacionesEstudiante />);
    const aviso = await screen.findByRole('alert');
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(aviso).toHaveTextContent('No se pudo cargar tu participación');
    await waitFor(() => expect(getParticipaciones).toHaveBeenCalledTimes(2));
  });
});
