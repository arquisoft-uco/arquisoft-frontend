import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../test-utils/store.utils';
import { useAccesoDenegadoStore } from '../auth/accesoDenegadoStore';
import { Rol } from '../shared/models/rol';
import AppLayout from './AppLayout';

vi.mock('./Header', () => ({ default: () => <header>Encabezado</header> }));

function renderizar() {
  render(
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<p>Contenido de inicio</p>} />
        <Route path="/evaluaciones" element={<p>Contenido de evaluaciones</p>} />
      </Route>
    </Routes>,
    { initialPath: '/dashboard' },
  );
}

describe('AppLayout', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [Rol.Coordinador] } } });
    setActiveRole(Rol.Coordinador);
    window.innerWidth = 1280;
  });

  it('con acceso denegado muestra el aviso junto al menú; abrir otra opción lo limpia', async () => {
    renderizar();
    act(() => useAccesoDenegadoStore.setState({ ruta: '/dashboard' }));

    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Contenido de inicio')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /evaluaciones/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: /evaluaciones/i }));

    expect(await screen.findByText('Contenido de evaluaciones')).toBeInTheDocument();
    expect(screen.queryByText('Acceso denegado')).not.toBeInTheDocument();
  });

  it('Reintentar limpia el estado y remonta el contenido', async () => {
    renderizar();
    act(() => useAccesoDenegadoStore.setState({ ruta: '/dashboard' }));

    await userEvent.click(screen.getByRole('button', { name: /reintentar/i }));

    expect(await screen.findByText('Contenido de inicio')).toBeInTheDocument();
    expect(useAccesoDenegadoStore.getState().ruta).toBeNull();
  });
});
