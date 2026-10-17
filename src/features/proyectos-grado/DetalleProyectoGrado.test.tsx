import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import DetalleProyectoGrado from './DetalleProyectoGrado';

vi.mock('./components/AsesorDetalleView', () => ({
  default: () => <p>Detalle asesor</p>,
}));

vi.mock('./components/CoordinadorDetalleView', () => ({
  default: () => <p>Detalle coordinador</p>,
}));

function renderizar() {
  return render(
    <Routes>
      <Route path="/proyectos-grado/:id" element={<DetalleProyectoGrado />} />
      <Route path="/seleccionar-rol" element={<p>Selector de rol</p>} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/proyectos-grado/p-1' },
  );
}

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
}

describe('DetalleProyectoGrado', () => {
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

  it('el coordinador ve su detalle', () => {
    // Arrange
    entrarComo(Rol.Coordinador);
    setActiveRole(Rol.Coordinador);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Detalle coordinador')).toBeInTheDocument();
  });

  it('el asesor ve su detalle', () => {
    // Arrange
    entrarComo(Rol.Asesor);
    setActiveRole(Rol.Asesor);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Detalle asesor')).toBeInTheDocument();
  });

  it('un rol sin vista va a /forbidden', () => {
    // Arrange
    entrarComo(Rol.Estudiante);
    setActiveRole(Rol.Estudiante);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
  });
});
