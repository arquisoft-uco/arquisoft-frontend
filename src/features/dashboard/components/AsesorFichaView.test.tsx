import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes, useLocation } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import type { FichaResumen } from '../models/FichaResumen';
import { useConteos } from '../hooks/useConteos';
import { useFichasAsesoradas } from '../hooks/useFichasAsesoradas';
import AsesorFichaView from './AsesorFichaView';

vi.mock('../hooks/useFichasAsesoradas', () => ({ useFichasAsesoradas: vi.fn() }));
vi.mock('../hooks/useConteos', () => ({ useConteos: vi.fn() }));

const ficha: FichaResumen = {
  id: 'f-3',
  titulo: 'Plataforma de riego',
  asesorNombre: 'Asesora Uno',
  asesorEmail: 'asesora@example.com',
  estadoId: 'EN_CONSTRUCCION',
  estadoNombre: 'En construcción',
  fechaActualizacion: '2026-05-02T10:00:00Z',
};

function fichasMock(parcial: Partial<ReturnType<typeof useFichasAsesoradas>> = {}) {
  vi.mocked(useFichasAsesoradas).mockReturnValue({
    fichas: [ficha],
    total: 1,
    cargado: true,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasAsesoradas>);
}

function Sonda() {
  const { pathname, state } = useLocation();
  return <output aria-label="Destino">{JSON.stringify({ pathname, state })}</output>;
}

describe('AsesorFichaView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', given_name: 'Uno' } });
    fichasMock();
    vi.mocked(useConteos).mockImplementation((recursos) => ({
      valores: recursos.map(() => 2),
      total: undefined,
      cargando: false,
      hayError: false,
      reintentar: vi.fn(),
    }));
  });

  it('lista las fichas asesoradas sin repetir el asesor y «Abrir» va al detalle con el resumen', async () => {
    const user = userEvent.setup();
    render(
      <Routes>
        <Route path="/dashboard" element={<AsesorFichaView />} />
        <Route path="/fichas-perfil/:id/items" element={<Sonda />} />
      </Routes>,
      { initialPath: '/dashboard' },
    );

    expect(screen.getByText('Asesoras 1 ficha de perfil.')).toBeInTheDocument();
    const bandeja = screen.getByRole('region', { name: 'Tus fichas de perfil' });
    expect(within(bandeja).getByText('En construcción')).toBeInTheDocument();
    expect(within(bandeja).queryByText(/Asesora Uno/)).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Resumen' })).getByRole('link', {
        name: /Evaluaciones de fichas/,
      }),
    ).toHaveAttribute('href', '/fichas-perfil?vista=evaluaciones');

    await user.click(
      within(bandeja).getByRole('button', { name: 'Abrir la ficha Plataforma de riego' }),
    );

    const destino = JSON.parse(screen.getByRole('status', { name: 'Destino' }).textContent!);
    expect(destino).toEqual({
      pathname: '/fichas-perfil/f-3/items',
      state: { resumen: ficha, search: '' },
    });
  });

  it('sin fichas muestra el vacío y la frase lo dice', () => {
    fichasMock({ fichas: [], total: 0 });

    render(<AsesorFichaView />);

    expect(screen.getByText('Aún no asesoras fichas de perfil.')).toBeInTheDocument();
    expect(screen.getByText('Aún no asesoras fichas de perfil')).toBeInTheDocument();
  });
});
