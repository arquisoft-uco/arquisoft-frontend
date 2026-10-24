import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import ItemsJuradoView from './ItemsJuradoView';

vi.mock('./ItemsCualitativosJuradoView', () => ({
  default: () => <p>Contenido cualitativos</p>,
}));

vi.mock('./ItemsCuantitativosJuradoView', () => ({
  default: () => <p>Contenido cuantitativos</p>,
}));

describe('ItemsJuradoView', () => {
  it('abre en Cualitativos con un único título y alterna al elegir Cuantitativos', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<ItemsJuradoView />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Ítems del jurado' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cualitativos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Contenido cualitativos')).toBeInTheDocument();
    expect(screen.queryByText('Contenido cuantitativos')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Cuantitativos' }));

    expect(screen.getByText('Contenido cuantitativos')).toBeInTheDocument();
    expect(screen.queryByText('Contenido cualitativos')).not.toBeInTheDocument();
  });
});
