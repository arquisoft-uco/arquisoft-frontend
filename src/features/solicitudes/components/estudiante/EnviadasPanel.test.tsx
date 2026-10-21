import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EnviadasPanel from './EnviadasPanel';

vi.mock('./SolicitudesEnviadasPanel', () => ({
  default: () => <p>Listado del coordinador</p>,
}));

vi.mock('./SolicitudesAsesorEnviadasPanel', () => ({
  default: () => <p>Listado del asesor</p>,
}));

describe('EnviadasPanel', () => {
  it('muestra por defecto el listado del coordinador y cambia al del asesor con el selector', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EnviadasPanel />);
    expect(screen.getByText('Listado del coordinador')).toBeInTheDocument();

    // Act
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo de solicitud' }), 'asesor');

    // Assert
    expect(screen.getByText('Listado del asesor')).toBeInTheDocument();
    expect(screen.queryByText('Listado del coordinador')).not.toBeInTheDocument();
  });
});
