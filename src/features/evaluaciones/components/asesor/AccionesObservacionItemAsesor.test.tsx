import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AccionesObservacionItemAsesor from './AccionesObservacionItemAsesor';

const OBSERVACION = { id: 'o-1', descripcion: 'Falta rigor' };

describe('AccionesObservacionItemAsesor', () => {
  it('muestra el rótulo oculto al lector, llama a onModificar con la observación; el nombre lleva la descripción solo con varias filas', async () => {
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
    const rotulo = screen.getByText('Modificar observación');
    await userEvent.click(screen.getByRole('button', { name: 'Modificar observación' }));
    rerender(
      <AccionesObservacionItemAsesor
        observacion={OBSERVACION}
        conVarias
        onModificar={onModificar}
      />,
    );

    // Assert
    expect(rotulo).toHaveAttribute('aria-hidden', 'true');
    expect(onModificar).toHaveBeenCalledWith(OBSERVACION);
    expect(
      screen.getByRole('button', { name: 'Modificar observación: Falta rigor' }),
    ).toBeInTheDocument();
  });

  it('con onRemover ofrece «Remover observación» junto al lápiz y lo llama con la observación; sin onRemover no existe', async () => {
    // Arrange
    const onRemover = vi.fn();
    const { rerender } = render(
      <AccionesObservacionItemAsesor
        observacion={OBSERVACION}
        conVarias
        onModificar={vi.fn()}
        onRemover={onRemover}
      />,
    );

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Remover observación: Falta rigor' }));
    const conviven = screen.queryByRole('button', { name: /^Modificar observación/ });
    rerender(<AccionesObservacionItemAsesor observacion={OBSERVACION} conVarias={false} />);

    // Assert
    expect(onRemover).toHaveBeenCalledWith(OBSERVACION);
    expect(conviven).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Remover observación/ })).not.toBeInTheDocument();
  });
});
