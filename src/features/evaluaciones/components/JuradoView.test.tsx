import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import JuradoView from './JuradoView';

vi.mock('./jurado/ConsultarEvaluacionesAsignadasJurado', () => ({
  default: () => <p>Contenido evaluaciones</p>,
}));
vi.mock('./ItemsCualitativosJuradoView', () => ({
  default: () => <p>Contenido cualitativos</p>,
}));
vi.mock('./ItemsCuantitativosJuradoView', () => ({
  default: () => <p>Contenido cuantitativos</p>,
}));

describe('JuradoView', () => {
  it('abre en Mis evaluaciones con un único título y alterna entre las tres pestañas', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<JuradoView />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('tab', { name: 'Mis evaluaciones' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Contenido evaluaciones')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Ítems cualitativos' }));

    // Assert
    expect(screen.getByText('Contenido cualitativos')).toBeInTheDocument();
    expect(screen.queryByText('Contenido evaluaciones')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Ítems cuantitativos' }));

    // Assert
    expect(screen.getByText('Contenido cuantitativos')).toBeInTheDocument();
    expect(screen.queryByText('Contenido cualitativos')).not.toBeInTheDocument();
  });
});
