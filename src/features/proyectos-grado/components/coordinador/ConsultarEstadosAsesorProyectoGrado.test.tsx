import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { EstadoAsesorProyectoGrado } from '../../models/EstadoAsesorProyectoGrado';
import { proyectosGradoService } from '../../services/proyectosGradoService';
import ConsultarEstadosAsesorProyectoGrado from './ConsultarEstadosAsesorProyectoGrado';

vi.mock('../../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getEstadosAsesor: vi.fn(),
  },
}));

const getEstadosAsesor = vi.mocked(proyectosGradoService.getEstadosAsesor);

const ESTADOS: EstadoAsesorProyectoGrado[] = [
  { id: 'ASIGNADO', nombre: 'Asignado', descripcion: 'El asesor está actualmente activo.' },
];

describe('ConsultarEstadosAsesorProyectoGrado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga muestra el estado de carga y no el vacío', () => {
    // Arrange
    getEstadosAsesor.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarEstadosAsesorProyectoGrado />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Aún no hay estados de asesor')).not.toBeInTheDocument();
  });

  it('al resolver muestra los estados', async () => {
    // Arrange
    getEstadosAsesor.mockResolvedValue(ESTADOS);

    // Act
    render(<ConsultarEstadosAsesorProyectoGrado />);

    // Assert
    expect((await screen.findAllByText('Asignado')).length).toBeGreaterThan(0);
  });

  it('ante un error muestra el aviso y al reintentar vuelve a consultar y muestra la tabla', async () => {
    // Arrange
    const usuario = userEvent.setup();
    getEstadosAsesor.mockRejectedValueOnce(new Error('fallo de red'));
    getEstadosAsesor.mockResolvedValueOnce(ESTADOS);
    render(<ConsultarEstadosAsesorProyectoGrado />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(
      within(aviso).getByText('No se pudieron cargar los estados de asesor'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    const tabla = await screen.findByRole('table', {
      name: 'Estados posibles de un asesor del proyecto de grado',
    });
    expect(within(tabla).getByText('Asignado')).toBeInTheDocument();
    await waitFor(() => expect(getEstadosAsesor).toHaveBeenCalledTimes(2));
  });
});
