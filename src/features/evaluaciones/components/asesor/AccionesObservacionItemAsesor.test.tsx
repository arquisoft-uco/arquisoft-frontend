import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AccionesObservacionItemAsesor from './AccionesObservacionItemAsesor';

const OBSERVACION = { id: 'o-1', descripcion: 'Falta rigor' };

describe('AccionesObservacionItemAsesor', () => {
  it('llama a onModificar con la observación; el nombre lleva la descripción solo con varias filas', async () => {
    // Arrange
    const onModificar = vi.fn();
    const { rerender } = render(
      <AccionesObservacionItemAsesor
        observacion={OBSERVACION}
        conVarias={false}
        onModificar={onModificar}
      />,
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Modificar observación' }));
    rerender(
      <AccionesObservacionItemAsesor
        observacion={OBSERVACION}
        conVarias
        onModificar={onModificar}
      />,
    );

    // Assert
    expect(onModificar).toHaveBeenCalledWith(OBSERVACION);
    expect(
      screen.getByRole('button', { name: 'Modificar observación: Falta rigor' }),
    ).toBeInTheDocument();
  });
});
