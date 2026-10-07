import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import type { FichaDelEstudiante } from '../models/FichaDelEstudiante';
import { useActividadFichaEstudiante } from '../hooks/useActividadFichaEstudiante';
import { useFichaDelEstudiante } from '../hooks/useFichaDelEstudiante';
import EstudianteView from './EstudianteView';

vi.mock('../hooks/useFichaDelEstudiante', () => ({ useFichaDelEstudiante: vi.fn() }));
vi.mock('../hooks/useActividadFichaEstudiante', () => ({ useActividadFichaEstudiante: vi.fn() }));

const ficha: FichaDelEstudiante = {
  id: 'f-1',
  titulo: 'Plataforma de riego',
  asesorNombre: 'Asesora Uno',
  estadoId: 'BORRADOR',
  estadoNombre: 'En borrador',
  fechaActualizacion: '2026-03-01T10:00:00Z',
  integrantes: ['Ana Gómez', 'Luis Pérez'],
};

function fichaMock(parcial: Partial<ReturnType<typeof useFichaDelEstudiante>> = {}) {
  vi.mocked(useFichaDelEstudiante).mockReturnValue({
    ficha,
    totalFichas: 1,
    cargado: true,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichaDelEstudiante>);
}

function actividadMock(parcial: Partial<ReturnType<typeof useActividadFichaEstudiante>> = {}) {
  vi.mocked(useActividadFichaEstudiante).mockReturnValue({
    estados: [],
    cargado: true,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useActividadFichaEstudiante>);
}

describe('EstudianteView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ username: 'ana.gomez', tokenParsed: { sub: 'u', given_name: 'Ana' } });
    actividadMock();
    fichaMock();
  });

  it('saluda con el nombre, resume la ficha y «Abrir ficha» navega a /fichas-perfil', async () => {
    const user = userEvent.setup();
    render(
      <Routes>
        <Route path="/dashboard" element={<EstudianteView />} />
        <Route path="/fichas-perfil" element={<p>Pantalla de fichas</p>} />
      </Routes>,
      { initialPath: '/dashboard' },
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Hola, Ana' })).toBeInTheDocument();
    expect(screen.getByText('Tu ficha de perfil está en «En borrador».')).toBeInTheDocument();
    expect(screen.getByText('Plataforma de riego')).toBeInTheDocument();
    expect(screen.getByText('Asesora Uno')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez, Luis Pérez')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir ficha' }));

    expect(screen.getByText('Pantalla de fichas')).toBeInTheDocument();
  });

  it('mientras carga muestra el esqueleto y nunca el vacío', () => {
    fichaMock({ ficha: undefined, totalFichas: 0, cargado: false });

    render(<EstudianteView />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu ficha');
    expect(screen.queryByText('Aún no tienes una ficha de perfil')).not.toBeInTheDocument();
  });

  it('sin ficha muestra el estado vacío y oculta la actividad', () => {
    fichaMock({ ficha: undefined, totalFichas: 0 });

    render(<EstudianteView />);

    expect(screen.getByText('Aún no tienes una ficha de perfil')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Actividad reciente' })).not.toBeInTheDocument();
  });

  it('con varias fichas lo indica', () => {
    fichaMock({ totalFichas: 3 });

    render(<EstudianteView />);

    expect(screen.getByText('Tienes 3 fichas de perfil')).toBeInTheDocument();
  });

  it('lista la actividad reciente con la fecha en <time>', () => {
    actividadMock({
      estados: [
        { id: 'BORRADOR', nombre: 'En borrador', fechaActualizacion: '2026-03-01T10:00:00Z' },
      ],
    });

    render(<EstudianteView />);

    const seccion = screen.getByRole('region', { name: 'Actividad reciente' });
    const hora = within(seccion).getByText(/2026/);
    expect(hora.tagName).toBe('TIME');
    expect(hora).toHaveAttribute('dateTime', '2026-03-01T10:00:00Z');
  });

  it('la ruta académica marca «En curso» solo el paso disponible y los demás «Pronto» sin enlace', () => {
    render(<EstudianteView />);

    const seccion = screen.getByRole('region', { name: 'Tu ruta académica' });
    expect(within(seccion).getAllByText('En curso')).toHaveLength(1);
    expect(within(seccion).getAllByText('Pronto')).toHaveLength(5);
    expect(within(seccion).getAllByRole('link')).toHaveLength(1);
  });

  it('un error de la ficha muestra alerta con «Reintentar» sin tumbar el resto del inicio', async () => {
    const user = userEvent.setup();
    const reintentar = vi.fn();
    fichaMock({ ficha: undefined, totalFichas: 0, cargado: false, hayError: true, reintentar });

    render(<EstudianteView />);

    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu ficha');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar una solicitud' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(reintentar).toHaveBeenCalled();
  });
});
