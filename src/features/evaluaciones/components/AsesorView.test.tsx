import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AsesorView from './AsesorView';

vi.mock('./asesor/ConsultarEvaluacionesAsesor', () => ({
  default: () => <p>Panel de evaluaciones</p>,
}));

vi.mock('./ItemsCualitativosAsesorView', () => ({
  default: () => <p>Panel de ítems cualitativos</p>,
}));

vi.mock('./CategoriasItemCuantitativoAsesorPanel', () => ({
  default: () => <p>Panel de categorías</p>,
}));

describe('AsesorView', () => {
  it('abre en «Mis evaluaciones» y la pestaña «Categorías cuantitativas» cambia el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsesorView />);
    expect(screen.getByText('Panel de evaluaciones')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('tab', { name: 'Categorías cuantitativas' }));

    // Assert
    expect(screen.getByText('Panel de categorías')).toBeInTheDocument();
    expect(screen.queryByText('Panel de evaluaciones')).not.toBeInTheDocument();
  });
});
