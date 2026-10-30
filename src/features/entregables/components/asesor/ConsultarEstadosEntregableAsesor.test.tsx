import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { EstadoEntregable } from '../../models/entregables';
import { entregablesService } from '../../services/entregablesService';
import ConsultarEstadosEntregableAsesor from './ConsultarEstadosEntregableAsesor';

vi.mock('../../services/entregablesService', () => ({
  entregablesService: {
    getEstadosEntregable: vi.fn(),
  },
}));

const getEstadosEntregable = vi.mocked(entregablesService.getEstadosEntregable);

const ESTADOS: EstadoEntregable[] = [
  { id: 'APROBADO', nombre: 'Aprobado', descripcion: 'El entregable fue aprobado' },
];

describe('ConsultarEstadosEntregableAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    getEstadosEntregable.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarEstadosEntregableAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con datos muestra una fila por estado', async () => {
    // Arrange
    getEstadosEntregable.mockResolvedValue(ESTADOS);

    // Act
    render(<ConsultarEstadosEntregableAsesor />);

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Estados de un entregable' });
    expect(within(tabla).getByText('Aprobado')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y al reintentar vuelve a consultar y muestra la tabla', async () => {
    // Arrange
    const usuario = userEvent.setup();
    getEstadosEntregable.mockRejectedValueOnce(new Error('fallo de red'));
    getEstadosEntregable.mockResolvedValueOnce(ESTADOS);
    render(<ConsultarEstadosEntregableAsesor />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(
      within(aviso).getByText('No se pudieron cargar los estados de entregable'),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Estados de un entregable' });
    expect(within(tabla).getByText('Aprobado')).toBeInTheDocument();
    await waitFor(() => expect(getEstadosEntregable).toHaveBeenCalledTimes(2));
  });
});
