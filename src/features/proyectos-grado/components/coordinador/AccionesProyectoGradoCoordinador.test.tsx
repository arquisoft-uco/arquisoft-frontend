import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AccionesProyectoGradoCoordinador from './AccionesProyectoGradoCoordinador';

vi.mock('./EstudiantesProyectoGradoPanel', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <div role="dialog" aria-label="Panel de estudiantes">
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

describe('AccionesProyectoGradoCoordinador', () => {
  it('abre el panel al pulsar «Asignar estudiantes» y lo cierra desde el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AccionesProyectoGradoCoordinador proyectoGradoId="p-1" titulo="Sistema" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar estudiantes' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de estudiantes' })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
