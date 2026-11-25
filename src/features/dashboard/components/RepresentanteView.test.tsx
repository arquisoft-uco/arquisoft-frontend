import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes, useLocation } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import type { FichaResumen } from '../models/FichaResumen';
import { useFichasPorEvaluar } from '../hooks/useFichasPorEvaluar';
import RepresentanteView from './RepresentanteView';

vi.mock('../hooks/useFichasPorEvaluar', () => ({ useFichasPorEvaluar: vi.fn() }));

const fila: FichaResumen = {
  id: 'f-9',
  titulo: 'Sistema de alertas',
  asesorNombre: 'Asesor Dos',
  asesorEmail: 'asesor@example.com',
  estadoId: 'DISPONIBLE_PARA_EVALUACION',
  estadoNombre: 'Disponible para evaluación',
  fechaActualizacion: '2026-04-10T10:00:00Z',
};

function bandejaMock(parcial: Partial<ReturnType<typeof useFichasPorEvaluar>> = {}) {
  vi.mocked(useFichasPorEvaluar).mockReturnValue({
    fichas: [fila],
    totalPorEvaluar: 7,
    cargado: true,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasPorEvaluar>);
}

function Sonda() {
  const { pathname, state } = useLocation();
  return <output aria-label="Destino">{JSON.stringify({ pathname, state })}</output>;
}

describe('RepresentanteView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', given_name: 'Rita' } });
    bandejaMock();
  });

  it('muestra la bandeja, la frase y las cifras que vienen de los hooks', () => {
    render(<RepresentanteView />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hola, Rita' })).toBeInTheDocument();
    expect(screen.getByText('Tienes 7 fichas por evaluar.')).toBeInTheDocument();
    const bandeja = screen.getByRole('region', { name: 'Fichas por evaluar' });
    expect(within(bandeja).getByText('Sistema de alertas')).toBeInTheDocument();
    expect(within(bandeja).getByText(/Asesor Dos/)).toBeInTheDocument();
    expect(within(bandeja).getByText('Disponible para evaluación')).toBeInTheDocument();
    const cifras = screen.getByRole('region', { name: 'Cifras' });
    expect(within(cifras).getByText('7')).toBeInTheDocument();
    expect(within(cifras).getByText('Fichas por evaluar')).toBeInTheDocument();
  });

  it('«Revisar» navega al detalle con el resumen de la fila en el state', async () => {
    const user = userEvent.setup();
    render(
      <Routes>
        <Route path="/dashboard" element={<RepresentanteView />} />
        <Route path="/fichas-perfil/:id/items" element={<Sonda />} />
      </Routes>,
      { initialPath: '/dashboard' },
    );

    await user.click(screen.getByRole('button', { name: 'Revisar la ficha Sistema de alertas' }));

    const destino = JSON.parse(screen.getByRole('status', { name: 'Destino' }).textContent!);
    expect(destino.pathname).toBe('/fichas-perfil/f-9/items');
    expect(destino.state).toEqual({ resumen: fila, search: '' });
  });

  it('sin fichas muestra el vacío con «Ver todas las fichas» hacia /fichas-perfil', async () => {
    const user = userEvent.setup();
    bandejaMock({ fichas: [], totalPorEvaluar: 0 });
    render(
      <Routes>
        <Route path="/dashboard" element={<RepresentanteView />} />
        <Route path="/fichas-perfil" element={<p>Pantalla de fichas</p>} />
      </Routes>,
      { initialPath: '/dashboard' },
    );

    expect(screen.getByText('No tienes fichas por evaluar.')).toBeInTheDocument();
    expect(screen.getByText('No hay fichas por evaluar')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver todas las fichas' }));

    expect(screen.getByText('Pantalla de fichas')).toBeInTheDocument();
  });

  it('un error de la bandeja muestra alerta con «Reintentar» y deja las cifras visibles', async () => {
    const user = userEvent.setup();
    const reintentar = vi.fn();
    bandejaMock({
      fichas: [],
      totalPorEvaluar: undefined,
      cargado: false,
      hayError: true,
      reintentar,
    });

    render(<RepresentanteView />);

    const bandeja = screen.getByRole('region', { name: 'Fichas por evaluar' });
    expect(within(bandeja).getByRole('alert')).toBeInTheDocument();
    const cifras = screen.getByRole('region', { name: 'Cifras' });
    expect(within(cifras).getByText('—')).toBeInTheDocument();

    await user.click(within(bandeja).getByRole('button', { name: 'Reintentar' }));
    await user.click(within(cifras).getByRole('button', { name: 'Reintentar' }));

    expect(reintentar).toHaveBeenCalledTimes(2);
  });
});
