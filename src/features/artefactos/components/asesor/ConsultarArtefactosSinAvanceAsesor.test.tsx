import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { artefactosService } from '../../services/artefactosService';
import ConsultarArtefactosSinAvanceAsesor from './ConsultarArtefactosSinAvanceAsesor';

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarArtefactosSinAvanceAsesor: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
  },
}));

const consultar = vi.mocked(artefactosService.consultarArtefactosSinAvanceAsesor);
const estados = vi.mocked(artefactosService.getEstadosRevisionAsesor);

describe('ConsultarArtefactosSinAvanceAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    estados.mockResolvedValue([]);
  });

  it('ante un error muestra ErrorState y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('falla'));
    render(<ConsultarArtefactosSinAvanceAsesor />, { initialPath: '/artefactos' });
    await screen.findByText('No se pudieron cargar los artefactos');

    // Act
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
  });

  it('con un plazo inválido muestra el mensaje junto al campo, no la tabla y no consulta', () => {
    // Arrange / Act
    render(<ConsultarArtefactosSinAvanceAsesor />, {
      initialPath: '/artefactos?vista=sin-avance&dias=0',
    });

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Indica un plazo válido')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(consultar).not.toHaveBeenCalled();
  });
});
