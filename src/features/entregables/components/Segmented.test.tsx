import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import Segmented from './Segmented';

const OPCIONES = [
  { id: 'activos', etiqueta: 'Activos' },
  { id: 'finalizados', etiqueta: 'Finalizados' },
];

describe('Segmented', () => {
  it('marca la opción elegida con aria-pressed y al hacer clic llama a onCambiar con el id', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCambiar = vi.fn();
    render(
      <Segmented
        opciones={OPCIONES}
        valor="activos"
        onCambiar={onCambiar}
        etiqueta="Proyectos de grado"
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Finalizados' }));

    // Assert
    expect(screen.getByRole('group', { name: 'Proyectos de grado' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activos' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Finalizados' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(onCambiar).toHaveBeenCalledWith('finalizados');
  });
});
