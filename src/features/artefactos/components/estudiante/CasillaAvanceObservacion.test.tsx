import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useCambiarEstadoObservacionEstudiante } from '../../hooks/useCambiarEstadoObservacionEstudiante';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import CasillaAvanceObservacion from './CasillaAvanceObservacion';

vi.mock('../../hooks/useCambiarEstadoObservacionEstudiante', () => ({
  useCambiarEstadoObservacionEstudiante: vi.fn(),
}));

type Resultado = ReturnType<typeof useCambiarEstadoObservacionEstudiante>;

const OBSERVACION: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-1',
  descripcion: 'Falta el diagrama',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
};

function montar(observacion: ObservacionRevision, isPending = false) {
  const mutate = vi.fn();
  const base: Partial<Resultado> = { mutate, isPending };
  vi.mocked(useCambiarEstadoObservacionEstudiante).mockReturnValue(
    Object.assign(base) as Resultado,
  );
  render(<CasillaAvanceObservacion observacion={observacion} revisionAsesorId="r-1" />);
  return { mutate };
}

describe('CasillaAvanceObservacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marcar una observación pendiente envía SOLUCIONADA', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = montar(OBSERVACION);

    // Act
    await user.click(screen.getByRole('checkbox', { name: 'Solucionada: Falta el diagrama' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith({
      observacionId: 'o-1',
      revisionAsesorId: 'r-1',
      estado: 'SOLUCIONADA',
    });
  });

  it('desmarcar una solucionada envía EN_PROGRESO', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = montar({ ...OBSERVACION, estadoId: 'SOLUCIONADA' });
    const casilla = screen.getByRole('checkbox', { name: 'Solucionada: Falta el diagrama' });

    // Act
    expect(casilla).toBeChecked();
    await user.click(casilla);

    // Assert
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ estado: 'EN_PROGRESO' }));
  });

  it('mientras guarda queda ocupada, conserva el foco y no envía otro cambio', async () => {
    // Arrange
    const user = userEvent.setup();
    const { mutate } = montar(OBSERVACION, true);
    const casilla = screen.getByRole('checkbox');

    // Act
    await user.click(casilla);

    // Assert
    expect(casilla).toHaveAttribute('aria-busy', 'true');
    expect(casilla).toHaveAttribute('aria-disabled', 'true');
    expect(mutate).not.toHaveBeenCalled();
  });
});
