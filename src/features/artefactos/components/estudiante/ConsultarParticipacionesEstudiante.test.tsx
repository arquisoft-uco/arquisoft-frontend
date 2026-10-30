import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { ParticipacionArtefacto } from '../../models/ParticipacionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import ConsultarParticipacionesEstudiante from './ConsultarParticipacionesEstudiante';

vi.mock('../../../../shared/services/cargaPrefirmadaService', () => ({
  cargaPrefirmadaService: { cargarArchivo: vi.fn() },
}));

vi.mock('../../services/artefactosService', () => ({
  artefactosService: { getParticipacionesEstudiante: vi.fn() },
}));

const getParticipaciones = vi.mocked(artefactosService.getParticipacionesEstudiante);

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
  };
}

describe('ConsultarParticipacionesEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(
      screen.getByRole('table', { name: 'Artefactos del proyecto Sistema de riego' }),
    ).toBeInTheDocument();
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
