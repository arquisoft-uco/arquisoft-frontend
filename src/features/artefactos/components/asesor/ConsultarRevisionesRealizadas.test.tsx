import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { Page } from '../../../../shared/models/api-response';
import type { RevisionAsesor } from '../../models/RevisionAsesor';
import { artefactosService } from '../../services/artefactosService';
import ConsultarRevisionesRealizadas from './ConsultarRevisionesRealizadas';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarRevisionesAsesor: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
    getObservacionesRevision: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarRevisionesAsesor);
const estados = vi.mocked(artefactosService.getEstadosRevisionAsesor);
const observaciones = vi.mocked(artefactosService.getObservacionesRevision);

const REVISION: RevisionAsesor = {
  id: 'r-1',
  versionArtefactoId: 'v-1',
  artefactoId: 'a-1',
  version: 3,
  estadoId: 'PENDIENTE',
  estadoNombre: 'Pendiente',
};

function pagina(content: RevisionAsesor[]): Page<RevisionAsesor> {
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

describe('ConsultarRevisionesRealizadas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockResolvedValue(pagina([REVISION]));
    estados.mockResolvedValue([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'RESUELTA', nombre: 'Resuelta', descripcion: '' },
    ]);
    observaciones.mockResolvedValue([]);
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarRevisionesRealizadas />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando revisiones realizadas…');
  });

  it('muestra las filas y el resumen con el total de revisiones', async () => {
    // Act
    render(<ConsultarRevisionesRealizadas />);

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Revisiones realizadas' });
    expect(within(tabla).getByText('Versión 3')).toBeInTheDocument();
    expect(screen.getByText('1 revisión')).toBeInTheDocument();
  });

  it('elegir un chip de estado vuelve a consultar con ese filtro', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarRevisionesRealizadas />);
    await screen.findByRole('table', { name: 'Revisiones realizadas' });

    // Act
    await user.click(await screen.findByRole('button', { name: 'Resuelta' }));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtros: expect.objectContaining({ operador: 'IN', valores: ['RESUELTA'] }),
        }),
      ),
    );
  });

  it('"Ver observaciones" abre el panel de esa revisión y "Cerrar" lo cierra conservando el filtro', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarRevisionesRealizadas />);
    await user.click(await screen.findByRole('button', { name: 'Resuelta' }));
    const tabla = await screen.findByRole('table', { name: 'Revisiones realizadas' });

    // Act
    await user.click(
      within(tabla).getByRole('button', { name: 'Acciones de la revisión de la versión 3' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Ver observaciones' }));

    // Assert
    expect(await screen.findByText('Observaciones de la revisión')).toBeInTheDocument();
    await waitFor(() => expect(observaciones).toHaveBeenCalledWith('r-1'));
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    await waitFor(() =>
      expect(screen.queryByText('Observaciones de la revisión')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Resuelta' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('ante un error muestra el aviso y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValueOnce(new Error('fallo de red'));
    render(<ConsultarRevisionesRealizadas />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('No se pudieron cargar las revisiones')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(await screen.findByRole('table', { name: 'Revisiones realizadas' })).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledTimes(2);
  });
});
