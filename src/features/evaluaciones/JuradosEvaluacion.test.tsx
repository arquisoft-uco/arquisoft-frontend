import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setAuthenticatedUser, setActiveRole } from '../../test-utils/store.utils';
import JuradosEvaluacion from './JuradosEvaluacion';
import { Rol } from '../../shared/models/rol';

vi.mock('./components/estudiante/JuradosEvaluacionEstudianteView', () => ({
  default: () => <p>Vista del estudiante</p>,
}));
vi.mock('./components/coordinador/JuradosEvaluacionCoordinadorView', () => ({
  default: () => <p>Vista del coordinador</p>,
}));

function montar() {
  return render(
    <Routes>
      <Route path="/evaluaciones/:evaluacionId/jurados" element={<JuradosEvaluacion />} />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
      <Route path="/seleccionar-rol" element={<p>Seleccionar rol</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/e-1/jurados' },
  );
}

function autenticarCon(roles: Rol[], activo?: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles } } });
  if (activo) setActiveRole(activo);
}

describe('JuradosEvaluacion', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('el estudiante ve su vista y no la del coordinador', () => {
    // Arrange
    autenticarCon([Rol.Estudiante], Rol.Estudiante);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Vista del estudiante')).toBeInTheDocument();
    expect(screen.queryByText('Vista del coordinador')).not.toBeInTheDocument();
  });

  it('el coordinador ve su vista y no la del estudiante', () => {
    // Arrange
    autenticarCon([Rol.Coordinador], Rol.Coordinador);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Vista del coordinador')).toBeInTheDocument();
    expect(screen.queryByText('Vista del estudiante')).not.toBeInTheDocument();
  });

  it('un rol fuera del mapa va a /forbidden y sin rol activo va a /seleccionar-rol', () => {
    // Arrange
    autenticarCon([Rol.Jurado], Rol.Jurado);

    // Act
    const { unmount } = montar();

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();

    // Arrange
    unmount();
    resetAllStores();
    autenticarCon([Rol.Estudiante, Rol.Coordinador]);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Seleccionar rol')).toBeInTheDocument();
  });
});
