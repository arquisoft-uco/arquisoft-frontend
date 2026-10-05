import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router';
import { render, screen, within } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import AsesorFichaDetalleView from './AsesorFichaDetalleView';

vi.mock('../hooks/useEstudiantesVinculados', () => ({ useEstudiantesVinculados: vi.fn() }));
vi.mock('./asesor-ficha/ItemsFichaAsesorPanel', () => ({ default: () => <div>Panel ítems</div> }));
vi.mock('./EstadosFichaPanel', () => ({ default: () => <div>Panel estados</div> }));

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles } } });
  if (roles.length === 1) setActiveRole(roles[0]);
}

const RESUMEN = {
  id: 'f-1',
  titulo: 'Ficha del asesor',
  estadoId: 'e-1',
  estadoNombre: 'En Construccion',
};

function Origen() {
  return (
    <Link to="/fichas-perfil/f-1/items" state={{ resumen: RESUMEN, search: '' }}>
      Abrir
    </Link>
  );
}

function renderizar(rutaInicial: string) {
  return render(
    <Routes>
      <Route path="/origen" element={<Origen />} />
      <Route path="/fichas-perfil/:id" element={<AsesorFichaDetalleView />}>
        <Route path="items" element={<div>Panel ítems</div>} />
        <Route path="estados" element={<div>Panel estados</div>} />
      </Route>
    </Routes>,
    { initialPath: rutaInicial },
  );
}

describe('AsesorFichaDetalleView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    entrarComo(Rol.AsesorFicha);
  });

  it('ofrece solo las pestañas Ítems y Estados', () => {
    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    const pestanas = screen.getByRole('navigation', { name: 'Secciones de la ficha' });
    expect(
      within(pestanas)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Ítems', 'Estados']);
  });

  it('cambiar de pestaña conserva el resumen aunque el state ya no viaje', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/origen');
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Act
    await user.click(screen.getByRole('link', { name: 'Estados' }));

    // Assert
    expect(screen.getByText('Panel estados')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha del asesor' })).toBeInTheDocument();
    expect(screen.getAllByText('En Construccion').length).toBeGreaterThan(0);
  });

  it('«Cambiar estado» del panel lateral lleva a la pestaña Estados', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/fichas-perfil/f-1/items');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(screen.getByText('Panel estados')).toBeInTheDocument();
  });

  it('sin state muestra el título genérico y el aviso, sin consultar el equipo', () => {
    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha de perfil' })).toBeInTheDocument();
    expect(screen.getByText(/No tenemos el resumen de esta ficha/)).toBeInTheDocument();
    expect(screen.queryByText('Equipo')).not.toBeInTheDocument();
  });
});
