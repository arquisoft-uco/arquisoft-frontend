import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';
import { Rol } from '../shared/models/rol';
import { cerrarSesion } from '../auth/session';
import Header from './Header';

vi.mock('../auth/session', () => ({ cerrarSesion: vi.fn() }));

function entrarComo(roles: Rol[], activo: Rol, claims: Record<string, unknown> = {}) {
  setAuthenticatedUser({
    tokenParsed: { sub: 'u', name: 'Ana María Gómez', realm_access: { roles }, ...claims },
  });
  setActiveRole(activo);
}

function renderizar() {
  render(<Header onMenuToggle={vi.fn()} isSidenavOpen />);
}

describe('Header', () => {
  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  it('el botón de cuenta muestra las iniciales y el menú, nombre completo y rol', async () => {
    const user = userEvent.setup();
    entrarComo([Rol.Estudiante], Rol.Estudiante);
    renderizar();

    const boton = screen.getByRole('button', { name: 'Menú de cuenta de usuario' });
    expect(boton).toHaveTextContent('AM');

    await user.click(boton);

    const menu = screen.getByRole('menu');
    expect(menu).toHaveTextContent('Ana María Gómez');
    expect(menu).toHaveTextContent('Estudiante');
  });

  it('«Cerrar sesión» cierra el menú y llama cerrarSesion', async () => {
    const user = userEvent.setup();
    entrarComo([Rol.Estudiante], Rol.Estudiante);
    renderizar();
    await user.click(screen.getByRole('button', { name: 'Menú de cuenta de usuario' }));

    await user.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    expect(cerrarSesion).toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('con varios roles el selector cambia el rol activo y se cierra', async () => {
    const user = userEvent.setup();
    entrarComo([Rol.Estudiante, Rol.Administrador], Rol.Estudiante);
    renderizar();

    await user.click(screen.getByRole('button', { name: /Rol activo: Estudiante/ }));
    await user.click(screen.getByRole('menuitem', { name: 'Administrador' }));

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rol activo: Administrador/ })).toBeInTheDocument();
  });

  it('con un rol único no hay botón de selector, solo la insignia', () => {
    entrarComo([Rol.Estudiante], Rol.Estudiante);

    renderizar();

    expect(screen.queryByRole('button', { name: /Rol activo/ })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Rol activo: Estudiante')).toBeInTheDocument();
  });

  it('abrir un menú cierra el otro', async () => {
    const user = userEvent.setup();
    entrarComo([Rol.Estudiante, Rol.Administrador], Rol.Estudiante);
    renderizar();

    await user.click(screen.getByRole('button', { name: /Rol activo/ }));
    expect(screen.getByRole('menu', { name: 'Cambiar rol activo' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Menú de cuenta de usuario' }));

    expect(screen.queryByRole('menu', { name: 'Cambiar rol activo' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('Esc y el clic fuera cierran el menú abierto', async () => {
    const user = userEvent.setup();
    entrarComo([Rol.Estudiante], Rol.Estudiante);
    renderizar();
    const boton = screen.getByRole('button', { name: 'Menú de cuenta de usuario' });

    await user.click(boton);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(boton);
    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
