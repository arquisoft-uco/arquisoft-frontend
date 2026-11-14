import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import { proyectosGradoService } from '../../services/proyectosGradoService';
import AccionesProyectoGradoCoordinador from './AccionesProyectoGradoCoordinador';

vi.mock('../../services/proyectosGradoService', () => ({
  proyectosGradoService: { cancelarProyecto: vi.fn() },
}));

vi.mock('./EstudiantesProyectoGradoPanel', () => ({
  default: ({ onCerrar, soloLectura }: { onCerrar: () => void; soloLectura?: boolean }) => (
    <div role="dialog" aria-label="Panel de estudiantes">
      <span>{soloLectura ? 'solo lectura' : 'vigente'}</span>
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

const cancelar = vi.mocked(proyectosGradoService.cancelarProyecto);

describe('AccionesProyectoGradoCoordinador', () => {
  it('abre el panel al pulsar «Ver estudiantes» y lo cierra desde el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <AccionesProyectoGradoCoordinador
        proyectoGradoId="p-1"
        titulo="Sistema"
        onCancelado={vi.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver estudiantes' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de estudiantes' })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('pasa «soloLectura» al panel', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <AccionesProyectoGradoCoordinador
        proyectoGradoId="p-1"
        titulo="Sistema"
        soloLectura
        onCancelado={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver estudiantes' }));

    // Assert
    expect(screen.getByText('solo lectura')).toBeInTheDocument();
  });

  it('ofrece «Cancelar proyecto» con EN_PROCESO, ATRASADO y estado desconocido, y no con FINALIZADO ni CANCELADO', () => {
    // Arrange
    const { rerender } = render(
      <AccionesProyectoGradoCoordinador
        proyectoGradoId="p-1"
        titulo="Sistema"
        onCancelado={vi.fn()}
      />,
    );
    const boton = () => screen.queryByRole('button', { name: 'Cancelar proyecto' });

    for (const estadoId of ['EN_PROCESO', 'ATRASADO', undefined]) {
      // Act
      rerender(
        <AccionesProyectoGradoCoordinador
          proyectoGradoId="p-1"
          titulo="Sistema"
          estadoId={estadoId}
          onCancelado={vi.fn()}
        />,
      );
      // Assert
      expect(boton()).toBeInTheDocument();
    }

    for (const estadoId of ['FINALIZADO', 'CANCELADO']) {
      // Act
      rerender(
        <AccionesProyectoGradoCoordinador
          proyectoGradoId="p-1"
          titulo="Sistema"
          estadoId={estadoId}
          soloLectura
          onCancelado={vi.fn()}
        />,
      );
      // Assert
      expect(boton()).not.toBeInTheDocument();
    }
  });

  it('el recorrido motivo, frase y confirmar cancela el proyecto y llama a onCancelado', async () => {
    // Arrange
    cancelar.mockResolvedValue(undefined);
    const user = userEvent.setup();
    const onCancelado = vi.fn();
    render(
      <AccionesProyectoGradoCoordinador
        proyectoGradoId="p-1"
        titulo="Sistema"
        estadoId="EN_PROCESO"
        onCancelado={onCancelado}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar proyecto' }));
    await user.type(
      screen.getByRole('textbox', { name: /Motivo de la cancelación/ }),
      'Sin avances',
    );
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Cancelar proyecto' }),
    );
    const confirmar = await screen.findByRole('button', { name: 'Cancelar proyecto de grado' });

    // Assert
    expect(confirmar).toBeDisabled();

    // Act
    await user.type(screen.getByRole('textbox'), 'Cancelar proyecto de grado');
    await user.click(confirmar);

    // Assert
    await waitFor(() => expect(onCancelado).toHaveBeenCalledTimes(1));
    expect(cancelar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1', motivo: 'Sin avances' });
  });
});
