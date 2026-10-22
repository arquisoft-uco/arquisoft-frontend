import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import RecibidasPanel from './RecibidasPanel';

interface PropsPanel {
  page: number;
  onPageChange: (page: number) => void;
}

vi.mock('./SolicitudesRecibidasPanel', () => ({
  default: ({ page, onPageChange }: PropsPanel) => (
    <button type="button" onClick={() => onPageChange(7)}>
      Panel de novedad, página {page}
    </button>
  ),
}));

vi.mock('./SolicitudesCambioAsesorRecibidasPanel', () => ({
  default: ({ page, onPageChange }: PropsPanel) => (
    <button type="button" onClick={() => onPageChange(8)}>
      Panel de cambio de asesor, página {page}
    </button>
  ),
}));

describe('RecibidasPanel del coordinador', () => {
  it('muestra novedad por defecto y al cambiar de tipo entrega a cada panel su propia página', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(
      <RecibidasPanel paginas={{ novedad: 2, 'cambio-asesor': 5 }} onPageChange={onPageChange} />,
    );
    const panelNovedad = screen.getByRole('button', { name: 'Panel de novedad, página 2' });

    // Act
    await user.click(panelNovedad);

    // Assert
    expect(onPageChange).toHaveBeenLastCalledWith('novedad', 7);

    // Act
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'cambio-asesor',
    );

    // Assert
    expect(screen.queryByText(/Panel de novedad/)).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Panel de cambio de asesor, página 5' }));

    // Assert
    expect(onPageChange).toHaveBeenLastCalledWith('cambio-asesor', 8);
  });
});
