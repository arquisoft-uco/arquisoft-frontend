import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import NuevaSolicitudPanel from './NuevaSolicitudPanel';
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

vi.mock('./NovedadCoordinadorForm', () => ({
  default: () => <h2>Formulario coordinador</h2>,
}));

vi.mock('./NovedadAsesorForm', () => ({
  default: () => <h2>Formulario asesor</h2>,
}));

vi.mock('./CambioAsesorForm', () => ({
  default: () => <h2>Formulario cambio de asesor</h2>,
}));

vi.mock('./AmpliacionPlazoForm', () => ({
  default: () => <h2>Formulario ampliación de plazo</h2>,
}));

describe('NuevaSolicitudPanel', () => {
  beforeEach(() => {
    mockCatalogo();
  });

  it('ofrece cuatro tipos habilitados y muestra por defecto el formulario del coordinador', () => {
    render(<NuevaSolicitudPanel />);

    const selector = screen.getByRole('combobox', { name: 'Tipo de solicitud' });
    const opciones = screen.getAllByRole('option');
    expect(opciones.map((o) => o.textContent)).toEqual([
      'Novedad para el Coordinador',
      'Novedad para el Asesor',
      'Cambio de Asesor',
      'Ampliación de Plazo',
    ]);
    opciones.forEach((o) => expect(o).toBeEnabled());
    expect(selector).toHaveValue('coordinador');
    expect(screen.getByRole('heading', { name: 'Formulario coordinador' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Formulario asesor' })).not.toBeInTheDocument();
  });

  it('cambia al formulario del asesor y desmonta el del coordinador al elegir Novedad al asesor', async () => {
    const user = userEvent.setup();
    render(<NuevaSolicitudPanel />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'Novedad para el Asesor',
    );

    expect(screen.getByRole('heading', { name: 'Formulario asesor' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Formulario coordinador' }),
    ).not.toBeInTheDocument();
  });

  it('cambia al formulario de cambio de asesor y desmonta el del coordinador al elegir Cambio de asesor', async () => {
    const user = userEvent.setup();
    render(<NuevaSolicitudPanel />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'Cambio de Asesor',
    );

    expect(
      screen.getByRole('heading', { name: 'Formulario cambio de asesor' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Formulario coordinador' }),
    ).not.toBeInTheDocument();
  });

  it('cambia al formulario de ampliación de plazo y desmonta el del coordinador al elegir Ampliación de plazo', async () => {
    const user = userEvent.setup();
    render(<NuevaSolicitudPanel />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'Ampliación de Plazo',
    );

    expect(
      screen.getByRole('heading', { name: 'Formulario ampliación de plazo' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Formulario coordinador' }),
    ).not.toBeInTheDocument();
  });
});
