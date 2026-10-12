import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import NuevaSolicitudPanel from './NuevaSolicitudPanel';

vi.mock('./NovedadCoordinadorForm', () => ({
  default: () => <h2>Formulario coordinador</h2>,
}));

vi.mock('./NovedadAsesorForm', () => ({
  default: () => <h2>Formulario asesor</h2>,
}));

describe('NuevaSolicitudPanel', () => {
  it('ofrece solo dos tipos habilitados y muestra por defecto el formulario del coordinador', () => {
    render(<NuevaSolicitudPanel />);

    const selector = screen.getByRole('combobox', { name: 'Tipo de solicitud' });
    const opciones = screen.getAllByRole('option');
    expect(opciones.map((o) => o.textContent)).toEqual([
      'Novedad al coordinador',
      'Novedad al asesor',
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
      'Novedad al asesor',
    );

    expect(screen.getByRole('heading', { name: 'Formulario asesor' })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Formulario coordinador' }),
    ).not.toBeInTheDocument();
  });
});
