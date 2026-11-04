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
  it('cada botón notifica el jurado a su callback', async () => {
    // Arrange
    const onVerCualitativa = vi.fn();
    const onVerCuantitativa = vi.fn();
    render(
      <AccionesJuradoEvaluacion
        jurado={JURADO}
        onVerCualitativa={onVerCualitativa}
        onVerCuantitativa={onVerCuantitativa}
      />,
    );

    // Act
    await userEvent.click(
      screen.getByRole('button', { name: 'Ver evaluación cualitativa de Ana Pérez' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Ver evaluación cuantitativa de Ana Pérez' }),
    );

    // Assert
    expect(onVerCualitativa).toHaveBeenCalledWith(JURADO);
    expect(onVerCuantitativa).toHaveBeenCalledWith(JURADO);
    expect(
      screen.getByRole('button', { name: 'Ver evaluación cuantitativa de Ana Pérez' }),
    ).toBeEnabled();
  });
});
