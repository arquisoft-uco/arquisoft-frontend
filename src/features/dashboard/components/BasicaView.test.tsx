import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import BasicaView from './BasicaView';

function entrarComo(rol: Rol) {
  setAuthenticatedUser({
    tokenParsed: { sub: 'u', given_name: 'Eva', realm_access: { roles: [rol] } },
  });
  setActiveRole(rol);
}

describe('BasicaView', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('ofrece como enlaces solo los módulos disponibles del rol, sin el inicio ni los «Próximamente»', () => {
    entrarComo(Rol.Coordinador);

    render(<BasicaView />);

    const enlaces = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(enlaces).toEqual(['/fichas-perfil', '/solicitudes']);
    expect(screen.queryByRole('link', { name: /Inicio/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Artefactos/ })).not.toBeInTheDocument();
  });

  it('la frase menciona la etiqueta del rol', () => {
    entrarComo(Rol.Jurado);

    render(<BasicaView />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hola, Eva' })).toBeInTheDocument();
    expect(screen.getByText(/tu rol de Jurado/)).toBeInTheDocument();
  });

  it('sin rol activo no hay módulos y muestra el vacío', () => {
    render(<BasicaView />);

    expect(screen.getByText('Aún no hay módulos disponibles para tu rol')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
