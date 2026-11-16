import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AyudaEstadosDocumentacion from './AyudaEstadosDocumentacion';

vi.mock('./EstadosDocumentacionPanel', () => ({ default: () => <div>Catálogo de estados</div> }));

describe('AyudaEstadosDocumentacion', () => {
  it('abre el panel lateral con el catálogo y Esc lo cierra devolviendo el foco al botón', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AyudaEstadosDocumentacion />);
    const boton = screen.getByRole('button', { name: '¿Qué significa cada estado?' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    await user.click(boton);

    // Assert
    expect(
      screen.getByRole('dialog', { name: 'Estados de una documentación' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Catálogo de estados')).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(boton).toHaveFocus();
  });

  it('el botón «Cerrar panel» cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AyudaEstadosDocumentacion />);
    await user.click(screen.getByRole('button', { name: '¿Qué significa cada estado?' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
