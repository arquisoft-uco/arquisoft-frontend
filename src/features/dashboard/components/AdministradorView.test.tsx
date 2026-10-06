import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import { useResumenUsuarios } from '../hooks/useResumenUsuarios';
import { useUsuariosPorRol } from '../hooks/useUsuariosPorRol';
import AdministradorView from './AdministradorView';

vi.mock('../hooks/useResumenUsuarios', () => ({ useResumenUsuarios: vi.fn() }));
vi.mock('../hooks/useUsuariosPorRol', () => ({ useUsuariosPorRol: vi.fn() }));

const ROLES = [
  Rol.Estudiante,
  Rol.Asesor,
  Rol.AsesorFicha,
  Rol.Coordinador,
  Rol.RepresentanteComiteCurriculum,
  Rol.Administrador,
  Rol.Bibliotecario,
];

function resumenMock(parcial: Partial<ReturnType<typeof useResumenUsuarios>> = {}) {
  vi.mocked(useResumenUsuarios).mockReturnValue({
    vigentes: 120,
    bajas: 15,
    cargando: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  });
}

function porRolMock(parcial: Partial<ReturnType<typeof useUsuariosPorRol>> = {}) {
  vi.mocked(useUsuariosPorRol).mockReturnValue({
    filas: ROLES.map((rol, i) => ({ rol, total: i + 1 })),
    cargando: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  });
}

describe('AdministradorView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', given_name: 'Admin' } });
    resumenMock();
    porRolMock();
  });

  it('muestra vigentes y bajas, los siete roles sin jurado, y «Registrar usuario» navega a /usuarios', async () => {
    const user = userEvent.setup();
    render(
      <Routes>
        <Route path="/dashboard" element={<AdministradorView />} />
        <Route path="/usuarios" element={<p>Pantalla de usuarios</p>} />
      </Routes>,
      { initialPath: '/dashboard' },
    );

    expect(screen.getByText('Hay 120 usuarios vigentes.')).toBeInTheDocument();
    const cifras = screen.getByRole('region', { name: 'Usuarios' });
    expect(within(cifras).getByText('Dados de baja')).toBeInTheDocument();
    expect(within(cifras).getByText('15')).toBeInTheDocument();
    const porRol = screen.getByRole('region', { name: 'Usuarios por rol' });
    expect(within(porRol).getAllByRole('listitem')).toHaveLength(7);
    expect(within(porRol).queryByText(/jurado/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Registrar usuario' }));

    expect(screen.getByText('Pantalla de usuarios')).toBeInTheDocument();
  });

  it('mientras carga muestra los esqueletos', () => {
    resumenMock({ vigentes: undefined, bajas: undefined, cargando: true });
    porRolMock({ cargando: true });

    render(<AdministradorView />);

    const estados = screen.getAllByRole('status');
    expect(estados).toHaveLength(2);
    expect(screen.getByText('Cargando cifras…')).toBeInTheDocument();
    expect(screen.getByText('Cargando usuarios por rol…')).toBeInTheDocument();
  });

  it('un conteo fallido muestra «—» con «Reintentar» y las demás filas intactas', async () => {
    const user = userEvent.setup();
    const reintentar = vi.fn();
    porRolMock({
      filas: ROLES.map((rol, i) => ({ rol, total: i === 1 ? undefined : 4 })),
      hayError: true,
      reintentar,
    });

    render(<AdministradorView />);

    const porRol = screen.getByRole('region', { name: 'Usuarios por rol' });
    expect(within(porRol).getAllByText('—')).toHaveLength(1);
    expect(within(porRol).getAllByText('4')).toHaveLength(6);

    await user.click(within(porRol).getByRole('button', { name: 'Reintentar' }));

    expect(reintentar).toHaveBeenCalled();
  });

  it('si fallan las cifras muestra «—», nunca cero, y ofrece «Reintentar»', async () => {
    const user = userEvent.setup();
    const reintentar = vi.fn();
    resumenMock({ vigentes: undefined, bajas: undefined, hayError: true, reintentar });

    render(<AdministradorView />);

    const cifras = screen.getByRole('region', { name: 'Usuarios' });
    expect(within(cifras).getAllByText('—')).toHaveLength(2);
    expect(within(cifras).queryByText('0')).not.toBeInTheDocument();

    await user.click(within(cifras).getByRole('button', { name: 'Reintentar' }));

    expect(reintentar).toHaveBeenCalled();
  });
});
