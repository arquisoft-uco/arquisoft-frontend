import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { EstadoRevisionAsesor } from '../../models/artefactos';
import { artefactosService } from '../../services/artefactosService';
import ConsultarEstadosRevisionAsesor from './ConsultarEstadosRevisionAsesor';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    getEstadosRevisionAsesor: vi.fn(),
  },
}));

const getEstadosRevisionAsesor = vi.mocked(artefactosService.getEstadosRevisionAsesor);

const ESTADOS: EstadoRevisionAsesor[] = [
  { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: 'Nueva revisión elaborada por el asesor' },
];

describe('ConsultarEstadosRevisionAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    getEstadosRevisionAsesor.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarEstadosRevisionAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y al reintentar vuelve a consultar y muestra la tabla', async () => {
    // Arrange
    const usuario = userEvent.setup();
    getEstadosRevisionAsesor.mockRejectedValueOnce(new Error('fallo de red'));
    getEstadosRevisionAsesor.mockResolvedValueOnce(ESTADOS);
    render(<ConsultarEstadosRevisionAsesor />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(
      within(aviso).getByText('No se pudieron cargar los estados de revisión'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Estados de una revisión del asesor' });
    expect(within(tabla).getByText('Pendiente')).toBeInTheDocument();
    await waitFor(() => expect(getEstadosRevisionAsesor).toHaveBeenCalledTimes(2));
  });
});
