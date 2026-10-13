import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import ProyectosGrado from './ProyectosGrado';

vi.mock('./components/CoordinadorView', () => ({
  default: () => <p>Vista coordinador</p>,
}));

vi.mock('./components/EstudianteView', () => ({
  default: () => <p>Vista estudiante</p>,
}));

function renderizar() {
  return render(
    <Routes>
      <Route path="/proyectos-grado" element={<ProyectosGrado />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/proyectos-grado' },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('ProyectosGrado', () => {
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

  it('el estudiante ve su vista', () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Vista estudiante')).toBeInTheDocument();
  });

  it('un rol sin vista va a /forbidden', () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });
});
