import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import EnviadasPanel from './EnviadasPanel';
import { useTiposSolicitud } from '../../hooks/useTiposSolicitud';
import type { TipoSolicitud } from '../../models/TipoSolicitud';

vi.mock('../../hooks/useTiposSolicitud', () => ({ useTiposSolicitud: vi.fn() }));

const TIPOS: TipoSolicitud[] = [
  { id: 'AMPLIACION_DE_PLAZO', nombre: 'Ampliación de Plazo', descripcion: 'd' },
  { id: 'CAMBIO_DE_ASESOR', nombre: 'Cambio de Asesor', descripcion: 'd' },
  { id: 'NOVEDAD_PARA_EL_ASESOR', nombre: 'Novedad para el Asesor', descripcion: 'd' },
  { id: 'NOVEDAD_PARA_EL_COORDINADOR', nombre: 'Novedad para el Coordinador', descripcion: 'd' },
];

function mockCatalogo() {
  vi.mocked(useTiposSolicitud).mockReturnValue({
    data: TIPOS,
    isError: false,
  } as ReturnType<typeof useTiposSolicitud>);
}

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
  beforeEach(() => {
    mockCatalogo();
  });

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
