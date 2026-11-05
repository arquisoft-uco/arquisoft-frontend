import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StrictMode } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../test-utils/render';
import { diferida } from '../../test-utils/promesas';
import { verificarSesionActiva } from '../../auth/session';
import { seguridadService } from './services/seguridadService';
import Seguridad from './Seguridad';

vi.mock('../../config/env', () => ({
  SECURITY_UI_CONFIG: {
    moduloUrl: 'http://ui.test/security.js',
    nombreAplicacion: 'arquisoft',
    apiBaseUrl: 'http://pdp.test',
  },
}));
vi.mock('../../auth/session', () => ({ verificarSesionActiva: vi.fn() }));
vi.mock('./services/seguridadService', () => ({ seguridadService: { cargarModulo: vi.fn() } }));

function moduloDoble() {
  const unmount = vi.fn();
  const mount = vi.fn(() => ({
    element: document.createElement('div'),
    refresh: vi.fn(),
    unmount,
  }));
  vi.mocked(seguridadService.cargarModulo).mockResolvedValue({ mount });
  return { mount, unmount };
}

describe('Seguridad', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('muestra la carga, monta Security UI sin credenciales y desmonta al salir', async () => {
    // Arrange
    const sesion = diferida();
    vi.mocked(verificarSesionActiva).mockImplementation(() => sesion.promesa);
    const { mount, unmount } = moduloDoble();

    // Act
    const { unmount: salir } = render(<Seguridad />);

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Administración de seguridad' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    sesion.resolver();
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    expect(seguridadService.cargarModulo).toHaveBeenCalledWith('http://ui.test/security.js');
    expect(mount).toHaveBeenCalledWith(expect.any(HTMLElement), {
      applicationName: 'arquisoft',
      apiBaseUrl: 'http://pdp.test',
      allowApplicationLifecycleManagement: false,
      theme: {
        accent: expect.any(String),
        fontFamily: expect.any(String),
        radius: expect.any(String),
      },
    });
    salir();
    expect(unmount).toHaveBeenCalledTimes(1);
  });

  it('en StrictMode cada montaje queda emparejado con su desmontaje', async () => {
    // Arrange
    vi.mocked(verificarSesionActiva).mockResolvedValue(undefined);
    const { mount, unmount } = moduloDoble();

    // Act
    const { unmount: salir } = render(
      <StrictMode>
        <Seguridad />
      </StrictMode>,
    );
    await waitFor(() => expect(mount).toHaveBeenCalled());
    salir();

    // Assert
    expect(unmount).toHaveBeenCalledTimes(mount.mock.calls.length);
  });

  it('si no hay sesión o el módulo no carga muestra el error y reintenta', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(verificarSesionActiva).mockRejectedValueOnce(new Error('sin sesión'));
    vi.mocked(verificarSesionActiva).mockResolvedValue(undefined);
    const { mount } = moduloDoble();

    // Act
    render(<Seguridad />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    await waitFor(() => expect(mount).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
