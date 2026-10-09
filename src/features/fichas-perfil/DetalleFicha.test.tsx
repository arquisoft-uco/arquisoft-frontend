import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Navigate, Route, Routes } from 'react-router';
import { render, screen, within } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import { useEvaluacionFicha } from './hooks/useEvaluacionFicha';
import DetalleFicha from './DetalleFicha';
import PestanaFicha from './components/PestanaFicha';

vi.mock('./hooks/useEvaluacionFicha', () => ({ useEvaluacionFicha: vi.fn() }));
vi.mock('./hooks/useHistorialEstadosFichaAsesor', () => ({
  useHistorialEstadosFichaAsesor: vi.fn(() => ({ data: undefined })),
}));
vi.mock('./hooks/useRegistrarEvaluacion', () => ({
  useRegistrarEvaluacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('./components/asesor-ficha/ItemsFichaAsesorPanel', () => ({
  default: ({ fichaPerfilId }: { fichaPerfilId: string }) => (
    <div>Ítems asesor {fichaPerfilId}</div>
  ),
}));
vi.mock('./components/representante/ItemsFichaRepresentantePanel', () => ({
  default: ({ fichaPerfilId }: { fichaPerfilId: string }) => (
    <div>Ítems representante {fichaPerfilId}</div>
  ),
}));
vi.mock('./components/asesor-ficha/EstadosFichaAsesorPanel', () => ({
  default: () => <div>Panel estados</div>,
}));
vi.mock('./components/representante/EstadosFichaRepresentantePanel', () => ({
  default: () => <div>Panel estados representante</div>,
}));
vi.mock('./components/representante/RegistrarEvaluacionPanel', () => ({
  default: () => <div>Panel evaluaciones</div>,
}));

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles } } });
  if (roles.length === 1) setActiveRole(roles[0]);
}

const RESUMEN = {
  id: 'f-1',
  titulo: 'Mi ficha de grado',
  estadoId: 'e-1',
  estadoNombre: 'Disponible Para Evaluacion',
  fechaActualizacion: '2026-10-02T10:00:00Z',
};

function Origen() {
  return (
    <Link to="/fichas-perfil/f-1/items" state={{ resumen: RESUMEN, search: '?q=grado&pagina=2' }}>
      Abrir desde el listado
    </Link>
  );
}

function renderizar(rutaInicial: string) {
  return render(
    <Routes>
      <Route path="/origen" element={<Origen />} />
      <Route path="/fichas-perfil" element={<div>Listado de fichas</div>} />
      <Route path="/fichas-perfil/:id" element={<DetalleFicha />}>
        <Route index element={<Navigate to="items" replace />} />
        <Route path="items" element={<PestanaFicha pestana="items" />} />
        <Route path="estados" element={<PestanaFicha pestana="estados" />} />
        <Route path="evaluaciones" element={<PestanaFicha pestana="evaluaciones" />} />
      </Route>
      <Route path="/forbidden" element={<div>Acceso denegado</div>} />
      <Route path="/seleccionar-rol" element={<div>Selecciona un rol</div>} />
    </Routes>,
    { initialPath: rutaInicial },
  );
}

describe('DetalleFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    vi.mocked(useEvaluacionFicha).mockReturnValue({
      data: [{ id: 'ev-1' }],
      isSuccess: true,
    } as ReturnType<typeof useEvaluacionFicha>);
  });

  it('la ruta de la ficha redirige a Ítems para cada rol', () => {
    // Arrange
    entrarComo(Rol.AsesorFicha);

    // Act
    const asesor = renderizar('/fichas-perfil/f-1');

    // Assert
    expect(screen.getByText('Ítems asesor f-1')).toBeInTheDocument();
    asesor.unmount();

    // Arrange
    resetAllStores();
    entrarComo(Rol.RepresentanteComiteCurriculum);

    // Act
    renderizar('/fichas-perfil/f-1');

    // Assert
    expect(screen.getByText('Ítems representante f-1')).toBeInTheDocument();
  });

  it('el representante ve su panel en Estados y una pestaña ajena al rol redirige a Ítems', () => {
    // Arrange
    entrarComo(Rol.RepresentanteComiteCurriculum);

    // Act
    const representante = renderizar('/fichas-perfil/f-1/estados');

    // Assert
    expect(screen.getByText('Panel estados representante')).toBeInTheDocument();
    expect(screen.queryByText('Ítems representante f-1')).not.toBeInTheDocument();
    representante.unmount();

    // Arrange
    resetAllStores();
    entrarComo(Rol.AsesorFicha);

    // Act
    renderizar('/fichas-perfil/f-1/evaluaciones');

    // Assert
    expect(screen.getByText('Ítems asesor f-1')).toBeInTheDocument();
    expect(screen.queryByText('Panel evaluaciones')).not.toBeInTheDocument();
  });

  it('un rol sin vista va a /forbidden y sin rol a /seleccionar-rol', () => {
    // Arrange
    entrarComo(Rol.Coordinador);

    // Act
    const coordinador = renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    coordinador.unmount();

    // Arrange
    resetAllStores();
    entrarComo(Rol.Estudiante);

    // Act
    const estudiante = renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    estudiante.unmount();

    // Arrange
    resetAllStores();
    entrarComo(Rol.Asesor, Rol.Coordinador);

    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByText('Selecciona un rol')).toBeInTheDocument();
  });

  it('con el state del listado muestra título, estado y fecha, y la miga restaura la búsqueda', async () => {
    // Arrange
    const user = userEvent.setup();
    entrarComo(Rol.AsesorFicha);
    renderizar('/origen');

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir desde el listado' }));

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Mi ficha de grado' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Disponible Para Evaluacion').length).toBeGreaterThan(0);
    expect(screen.getByText(/Actualizada el/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /volver/i })).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: 'Secciones de la ficha' }))
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Ítems', 'Estados']);
    expect(screen.getByRole('link', { name: 'Fichas de perfil' })).toHaveAttribute(
      'href',
      '/fichas-perfil?q=grado&pagina=2',
    );
  });

  it('sin state muestra el título genérico, el aviso, la miga sin búsqueda y las secciones por id', () => {
    // Arrange
    entrarComo(Rol.AsesorFicha);

    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha de perfil' })).toBeInTheDocument();
    expect(screen.getByText(/No tenemos el resumen de esta ficha/)).toBeInTheDocument();
    expect(screen.queryByText(/Actualizada el/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fichas de perfil' })).toHaveAttribute(
      'href',
      '/fichas-perfil',
    );
    expect(screen.getByText('Ítems asesor f-1')).toBeInTheDocument();
  });
});
