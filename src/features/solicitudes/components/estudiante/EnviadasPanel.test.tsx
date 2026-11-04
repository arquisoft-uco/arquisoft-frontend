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

vi.mock('./SolicitudesCambioAsesorEnviadasPanel', () => ({
  default: () => <p>Listado del cambio de asesor</p>,
}));

vi.mock('./SolicitudesAmpliacionPlazoEnviadasPanel', () => ({
  default: () => <p>Listado de la ampliación de plazo</p>,
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

  it('ofrece cuatro tipos y al elegir «Cambio de asesor» muestra su listado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EnviadasPanel />);
    const selector = screen.getByRole('combobox', { name: 'Tipo de solicitud' });

    // Act
    await user.selectOptions(selector, 'cambio-asesor');

    // Assert
    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByText('Listado del cambio de asesor')).toBeInTheDocument();
    expect(screen.queryByText('Listado del coordinador')).not.toBeInTheDocument();
  });

  it('al elegir «Ampliación de plazo» muestra su listado', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EnviadasPanel />);

    // Act
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'ampliacion-plazo',
    );

    // Assert
    expect(screen.getByText('Listado de la ampliación de plazo')).toBeInTheDocument();
    expect(screen.queryByText('Listado del coordinador')).not.toBeInTheDocument();
  });
});
