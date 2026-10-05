import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import Notice from './Notice';

describe('Notice', () => {
  it.each([
    ['peligro', 'alert'],
    ['exito', 'status'],
    ['info', 'note'],
    ['advertencia', 'note'],
  ] as const)('la variante %s se anuncia con el rol %s', (variante, rol) => {
    // Act
    render(<Notice variante={variante}>Mensaje del aviso</Notice>);

    // Assert
    expect(screen.getByRole(rol)).toHaveTextContent('Mensaje del aviso');
  });

  it('usa etiqueta como nombre accesible del aviso', () => {
    // Act
    render(
      <Notice variante="advertencia" etiqueta="No disponible: asesores">
        Esta opción aún no está disponible.
      </Notice>,
    );

    // Assert
    expect(screen.getByRole('note', { name: 'No disponible: asesores' })).toHaveTextContent(
      'Esta opción aún no está disponible.',
    );
  });

  it('llama a onClick de la acción al pulsar su botón', async () => {
    // Arrange
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Notice variante="info" accion={{ etiqueta: 'Ver detalle', onClick }}>
        Hay cambios pendientes.
      </Notice>,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver detalle' }));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
