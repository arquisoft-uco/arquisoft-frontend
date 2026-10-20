import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils/render';
import { diferida } from '../test-utils/promesas';
import { resetAllStores, setAuthenticatedUser } from '../test-utils/store.utils';
import { useAuthStore } from '../auth/authStore';
import { initDevAuth } from '../auth/devAuth';
import { resolverProveedor, restaurarSesion } from '../auth/session';
import { useProveedoresDisponibles } from '../hooks/useAuth';
import AuthGuard from './AuthGuard';

const entorno = vi.hoisted(() => ({ bypass: false }));

vi.mock('../config/env', () => ({
  get AUTH_BYPASS() {
    return entorno.bypass;
  },
}));
vi.mock('../auth/session', () => ({ resolverProveedor: vi.fn(), restaurarSesion: vi.fn() }));
vi.mock('../auth/devAuth', () => ({ initDevAuth: vi.fn() }));
vi.mock('../hooks/useAuth', () => ({ useProveedoresDisponibles: vi.fn() }));

const KEYCLOAK = { id: 'keycloak', titulo: 'Keycloak', descripcion: '' };
const PDP = { id: 'pdp', titulo: 'Security Baseline', descripcion: '' };

function renderizar() {
  render(
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/privada" element={<p>Contenido privado</p>} />
      </Route>
      <Route path="/iniciar-sesion" element={<p>Selector de proveedor</p>} />
    </Routes>,
    { initialPath: '/privada' },
  );
}

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    entorno.bypass = false;
    resetAllStores();
    useAuthStore.getState().reset();
    vi.mocked(useProveedoresDisponibles).mockReturnValue([KEYCLOAK]);
  });

  it('con varios proveedores y ninguno elegido lleva al selector sin restaurar sesión', () => {
    // Arrange
    vi.mocked(useProveedoresDisponibles).mockReturnValue([KEYCLOAK, PDP]);
    vi.mocked(resolverProveedor).mockReturnValue(null);

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Selector de proveedor')).toBeInTheDocument();
    expect(restaurarSesion).not.toHaveBeenCalled();
  });

  it('con un proveedor restaura la sesión, muestra el cargador y luego el contenido', async () => {
    // Arrange
    const restauracion = diferida();
    vi.mocked(resolverProveedor).mockReturnValue('keycloak');
    vi.mocked(restaurarSesion).mockImplementation(async () => {
      await restauracion.promesa;
      setAuthenticatedUser();
    });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    restauracion.resolver();
    expect(await screen.findByText('Contenido privado')).toBeInTheDocument();
    expect(restaurarSesion).toHaveBeenCalledTimes(1);
  });

  it('con el bypass usa el usuario de desarrollo y no consulta ningún proveedor', async () => {
    // Arrange
    entorno.bypass = true;
    vi.mocked(initDevAuth).mockImplementation(() => setAuthenticatedUser());

    // Act
    renderizar();

    // Assert
    expect(await screen.findByText('Contenido privado')).toBeInTheDocument();
    expect(restaurarSesion).not.toHaveBeenCalled();
    expect(resolverProveedor).not.toHaveBeenCalled();
  });

  it('si falla muestra el error, reintenta y, con varios proveedores, ofrece elegir otro método', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useProveedoresDisponibles).mockReturnValue([KEYCLOAK, PDP]);
    vi.mocked(resolverProveedor).mockReturnValue('keycloak');
    vi.mocked(restaurarSesion).mockRejectedValueOnce(new Error('sin red'));
    vi.mocked(restaurarSesion).mockImplementationOnce(async () => setAuthenticatedUser());

    // Act
    renderizar();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Elegir otro método' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(await screen.findByText('Contenido privado')).toBeInTheDocument();
    expect(restaurarSesion).toHaveBeenCalledTimes(2);
  });
});
