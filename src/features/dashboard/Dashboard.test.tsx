import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import Dashboard from './Dashboard';

vi.mock('./components/EstudianteView', () => ({ default: () => <p>Vista estudiante</p> }));
vi.mock('./components/RepresentanteView', () => ({ default: () => <p>Vista representante</p> }));
vi.mock('./components/AdministradorView', () => ({ default: () => <p>Vista administrador</p> }));
vi.mock('./components/BasicaView', () => ({ default: () => <p>Vista básica</p> }));

function renderizar() {
  return render(
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/dashboard' },
  );
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('Dashboard', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    setAuthenticatedUser({
      tokenParsed: { sub: 'u', realm_access: { roles: [Rol.Estudiante, Rol.Asesor] } },
    });

    renderizar();

    expect(screen.getByText('Selector de rol')).toBeInTheDocument();
  });

  it.each([
    [Rol.Estudiante, 'Vista estudiante'],
    [Rol.RepresentanteComiteCurriculum, 'Vista representante'],
    [Rol.Administrador, 'Vista administrador'],
  ])('el rol %s ve su vista propia', (rol, texto) => {
    entrarComo(rol);

    renderizar();

    expect(screen.getByText(texto)).toBeInTheDocument();
  });

  it('un rol sin vista propia recibe la básica y no /forbidden', () => {
    entrarComo(Rol.Bibliotecario);

    renderizar();

    expect(screen.getByText('Vista básica')).toBeInTheDocument();
    expect(screen.queryByText('Acceso denegado')).not.toBeInTheDocument();
  });
});
