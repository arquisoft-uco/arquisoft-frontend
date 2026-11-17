import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';
import { Rol } from '../shared/models/rol';
import RoleGuard from './RoleGuard';

function renderizar(roles: Rol[]) {
  render(
    <Routes>
      <Route
        path="/seccion"
        element={
          <RoleGuard roles={roles}>
            <p>Contenido protegido</p>
          </RoleGuard>
        }
      />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
    </Routes>,
    { initialPath: '/seccion' },
  );
}

function entrarConRoles(roles: Rol[], activo?: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
  if (activo) setActiveRole(activo);
}

describe('RoleGuard', () => {
  beforeEach(() => resetAllStores());

  it('deja pasar sin restricción de roles y con un rol permitido', () => {
    entrarConRoles([Rol.Asesor]);
    renderizar([]);
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('deja pasar con un rol permitido', () => {
    entrarConRoles([Rol.Asesor], Rol.Asesor);
    renderizar([Rol.Asesor]);
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('muestra Acceso denegado con un rol no permitido', () => {
    entrarConRoles([Rol.Estudiante], Rol.Estudiante);
    renderizar([Rol.Asesor]);
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('manda a seleccionar rol con varios roles y ninguno activo', () => {
    entrarConRoles([Rol.Asesor, Rol.Estudiante]);
    renderizar([Rol.Asesor]);
    expect(screen.getByText('Selector de rol')).toBeInTheDocument();
  });
});
