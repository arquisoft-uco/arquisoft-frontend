import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import AccionesJuradoEvaluacion from './AccionesJuradoEvaluacion';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';

const JURADO: EvaluacionJurado = {
  id: 'ej-1',
  jurado: { id: 'j-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
};

describe('AccionesJuradoEvaluacion', () => {
  it('la cualitativa notifica el jurado y la cuantitativa queda deshabilitada', async () => {
    // Arrange
    const onVerCualitativa = vi.fn();
    render(<AccionesJuradoEvaluacion jurado={JURADO} onVerCualitativa={onVerCualitativa} />);

    // Act
    await userEvent.click(
      screen.getByRole('button', { name: 'Ver evaluación cualitativa de Ana Pérez' }),
    );

    // Assert
    expect(onVerCualitativa).toHaveBeenCalledTimes(1);
    expect(onVerCualitativa).toHaveBeenCalledWith(JURADO);
    expect(
      screen.getByRole('button', {
        name: 'Ver evaluación cuantitativa de Ana Pérez (próximamente)',
      }),
    ).toBeDisabled();
  });
});
