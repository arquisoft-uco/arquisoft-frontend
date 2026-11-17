import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../models/rol';
import AccesoDenegado from './AccesoDenegado';

function entrarConRoles(roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles } } });
  setActiveRole(roles[0]);
}

describe('AccesoDenegado', () => {
  beforeEach(() => resetAllStores());

  it('ofrece Reintentar solo con onReintentar y lo invoca', async () => {
    entrarConRoles([Rol.Asesor]);
    const onReintentar = vi.fn();

    const { rerender } = render(<AccesoDenegado />);
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();

    rerender(<AccesoDenegado onReintentar={onReintentar} />);
    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(onReintentar).toHaveBeenCalledTimes(1);
  });

  it('menciona cambiar de rol solo con más de un rol', () => {
    entrarConRoles([Rol.Asesor]);
    const { unmount } = render(<AccesoDenegado />);
    expect(screen.queryByText(/cambia de rol/i)).not.toBeInTheDocument();
    unmount();

    entrarConRoles([Rol.Asesor, Rol.Estudiante]);
    render(<AccesoDenegado />);
    expect(screen.getByText(/cambia de rol/i)).toBeInTheDocument();
  });
});
