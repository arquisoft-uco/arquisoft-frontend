import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import ItemsAdministradorView from './ItemsAdministradorView';

vi.mock('./ItemsCualitativosJuradoView', () => ({
  default: () => <p>Contenido cualitativos del jurado</p>,
}));

vi.mock('./ItemsCuantitativosJuradoView', () => ({
  default: () => <p>Contenido cuantitativos del jurado</p>,
}));

vi.mock('./ItemsCuantitativosAsesorView', () => ({
  default: () => <p>Contenido cuantitativos del asesor</p>,
}));

vi.mock('./ItemsCualitativosAsesorView', () => ({
  default: () => <p>Contenido cualitativos del asesor</p>,
}));

describe('ItemsAdministradorView', () => {
  it('abre en Cualitativos del jurado con un único título y alterna entre las pestañas', async () => {
    // Arrange
    const user = userEvent.setup();

    // Act
    render(<ItemsAdministradorView />);

    // Assert
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ítems de evaluación' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Cualitativos del jurado' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Contenido cualitativos del jurado')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Cuantitativos del jurado' }));
    expect(screen.getByText('Contenido cuantitativos del jurado')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Cuantitativos del asesor' }));
    expect(screen.getByText('Contenido cuantitativos del asesor')).toBeInTheDocument();
    expect(screen.queryByText('Contenido cuantitativos del jurado')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Cualitativos del asesor' }));
    expect(screen.getByText('Contenido cualitativos del asesor')).toBeInTheDocument();
  });
});
