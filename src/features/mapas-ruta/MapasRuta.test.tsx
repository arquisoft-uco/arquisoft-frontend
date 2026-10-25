import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import MapasRuta from './MapasRuta';

vi.mock('./components/CoordinadorView', () => ({
  default: () => <p>Vista coordinador</p>,
}));

function renderizar() {
  return render(
    <Routes>
      <Route path="/mapas-ruta" element={<MapasRuta />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/mapas-ruta' },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('MapasRuta', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('sin rol activo redirige a /seleccionar-rol', () => {
    // Arrange
    entrarComo(Rol.Coordinador, Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Selector de rol')).toBeInTheDocument();
  });

  it('el coordinador ve su vista', () => {
    // Arrange
    entrarComo(Rol.Coordinador);
    setActiveRole(Rol.Coordinador);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Vista coordinador')).toBeInTheDocument();
  });

  it('un rol sin vista redirige a /forbidden', () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Vista coordinador')).not.toBeInTheDocument();
  });
});
