import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Navigate, Route, Routes } from 'react-router';
import { render, screen, within } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import { useEvaluacionFicha } from '../hooks/useEvaluacionFicha';
import RepresentanteDetalleView from './RepresentanteDetalleView';

vi.mock('../hooks/useEvaluacionFicha', () => ({ useEvaluacionFicha: vi.fn() }));
vi.mock('../hooks/useEstudiantesVinculados', () => ({ useEstudiantesVinculados: vi.fn() }));
vi.mock('../hooks/useDescartarEvaluacion', () => ({
  useDescartarEvaluacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('../hooks/useRegistrarEvaluacion', () => ({
  useRegistrarEvaluacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

function entrarComo(...roles: Rol[]) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles } } });
  if (roles.length === 1) setActiveRole(roles[0]);
}

const RESUMEN = {
  id: 'f-1',
  titulo: 'Ficha del comité',
  estadoId: 'DISPONIBLE_PARA_EVALUACION',
  estadoNombre: 'Disponible Para Evaluacion',
  asesorNombre: 'Ana Gómez',
  asesorEmail: 'ana@uco.edu.co',
};

function mockEvaluaciones(parcial: {
  data?: Array<{ id: string; estadoEvaluacionId?: string | null }>;
  isSuccess: boolean;
}) {
  vi.mocked(useEvaluacionFicha).mockReturnValue(parcial as ReturnType<typeof useEvaluacionFicha>);
}

let resumenActual = RESUMEN;

function Origen() {
  return (
    <Link to="/fichas-perfil/f-1/items" state={{ resumen: resumenActual, search: '' }}>
      Abrir
    </Link>
  );
}

function renderizar(rutaInicial: string, entrada?: string) {
  return render(
    <Routes>
      {entrada && (
        <Route
          path="/entrada"
          element={
            <Navigate
              to={entrada}
              replace
              state={{ resumen: resumenActual, search: '?q=comite' }}
            />
          }
        />
      )}
      <Route path="/fichas-perfil" element={<div>Listado de fichas</div>} />
      <Route path="/origen" element={<Origen />} />
      <Route path="/fichas-perfil/:id" element={<RepresentanteDetalleView />}>
        <Route path="items" element={<div>Panel ítems</div>} />
        <Route path="evaluaciones" element={<div>Panel evaluaciones</div>} />
      </Route>
    </Routes>,
    { initialPath: rutaInicial },
  );
}

function renderizarConContexto(rutaDetalle: string) {
  return renderizar('/entrada', rutaDetalle);
}

describe('RepresentanteDetalleView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resumenActual = RESUMEN;
    resetAllStores();
    entrarComo(Rol.RepresentanteComiteCurriculum);
    mockEvaluaciones({ data: [], isSuccess: true });
  });

  it('ofrece las pestañas Ítems, Estados y Evaluaciones y consulta las evaluaciones de la ficha', () => {
    // Act
    renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    const pestanas = screen.getByRole('navigation', { name: 'Secciones de la ficha' });
    expect(
      within(pestanas)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Ítems', 'Estados', 'Evaluaciones']);
    expect(useEvaluacionFicha).toHaveBeenCalledWith('f-1');
  });

  it('con el state muestra estado y asesor, y cambiar de pestaña conserva el resumen', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/origen');
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Act
    await user.click(screen.getByRole('link', { name: 'Evaluaciones' }));

    // Assert
    expect(screen.getByText('Panel evaluaciones')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha del comité' })).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
  });

  it('sin evaluación ofrece «Iniciar evaluación» y no «Evaluar ficha»', () => {
    // Act
    renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('button', { name: 'Iniciar evaluación' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Evaluar ficha' })).not.toBeInTheDocument();
  });

  it('con una evaluación abierta ofrece «Evaluar ficha» y lleva a la pestaña Evaluaciones', async () => {
    // Arrange
    const user = userEvent.setup();
    mockEvaluaciones({ data: [{ id: 'ev-1', estadoEvaluacionId: null }], isSuccess: true });
    renderizarConContexto('/fichas-perfil/f-1/items');
    expect(screen.queryByRole('button', { name: 'Iniciar evaluación' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Evaluar ficha' }));

    // Assert
    expect(screen.getByText('Panel evaluaciones')).toBeInTheDocument();
  });

  it('no ofrece acciones con una evaluación final, mientras carga ni en la pestaña Evaluaciones', () => {
    // Arrange
    mockEvaluaciones({ data: [{ id: 'ev-1', estadoEvaluacionId: 'DESCARTADA' }], isSuccess: true });

    // Act
    const conFinal = renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.queryByRole('button', { name: 'Evaluar ficha' })).not.toBeInTheDocument();
    conFinal.unmount();

    // Arrange
    mockEvaluaciones({ data: undefined, isSuccess: false });

    // Act
    const cargando = renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.queryByRole('button', { name: 'Evaluar ficha' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Iniciar evaluación' })).not.toBeInTheDocument();
    cargando.unmount();

    // Arrange
    mockEvaluaciones({ data: [], isSuccess: true });

    // Act
    renderizarConContexto('/fichas-perfil/f-1/evaluaciones');

    // Assert
    expect(screen.queryByRole('button', { name: 'Evaluar ficha' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Iniciar evaluación' })).not.toBeInTheDocument();
  });

  it('con la evaluación en curso y la ficha disponible ofrece «Evaluar ficha» y «Descartar evaluación», y en la pestaña Evaluaciones solo el descarte', () => {
    // Arrange
    mockEvaluaciones({
      data: [{ id: 'ev-1', estadoEvaluacionId: 'EN_EVALUACION' }],
      isSuccess: true,
    });

    // Act
    const items = renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('button', { name: 'Evaluar ficha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar evaluación' })).toBeInTheDocument();
    items.unmount();

    // Act
    renderizarConContexto('/fichas-perfil/f-1/evaluaciones');

    // Assert
    expect(screen.queryByRole('button', { name: 'Evaluar ficha' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Descartar evaluación' })).toBeInTheDocument();
  });

  it('con la evaluación en curso y la ficha en otro estado ofrece «Evaluar ficha» sin descartar', () => {
    // Arrange
    resumenActual = { ...RESUMEN, estadoId: 'EN_REVISION' };
    mockEvaluaciones({
      data: [{ id: 'ev-1', estadoEvaluacionId: 'EN_EVALUACION' }],
      isSuccess: true,
    });

    // Act
    renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('button', { name: 'Evaluar ficha' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descartar evaluación' })).not.toBeInTheDocument();
  });

  it('sin evaluación y con la ficha en otro estado no ofrece «Iniciar evaluación»', () => {
    // Arrange
    resumenActual = { ...RESUMEN, estadoId: 'EN_REVISION' };

    // Act
    renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha del comité' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Iniciar evaluación' })).not.toBeInTheDocument();
  });

  it('con la evaluación descartada ofrece «Reanudar evaluación» solo con la ficha disponible y fuera de la pestaña Evaluaciones', () => {
    // Arrange
    mockEvaluaciones({ data: [{ id: 'ev-1', estadoEvaluacionId: 'DESCARTADA' }], isSuccess: true });

    // Act
    const items = renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('button', { name: 'Reanudar evaluación' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descartar evaluación' })).not.toBeInTheDocument();
    items.unmount();

    // Act
    const evaluaciones = renderizarConContexto('/fichas-perfil/f-1/evaluaciones');

    // Assert
    expect(screen.queryByRole('button', { name: 'Reanudar evaluación' })).not.toBeInTheDocument();
    evaluaciones.unmount();

    // Arrange
    resumenActual = { ...RESUMEN, estadoId: 'EN_REVISION' };

    // Act
    renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.queryByRole('button', { name: 'Reanudar evaluación' })).not.toBeInTheDocument();
  });

  it('con una evaluación finalizada no ofrece ninguna acción', () => {
    // Arrange
    mockEvaluaciones({ data: [{ id: 'ev-1', estadoEvaluacionId: 'APROBADA' }], isSuccess: true });

    // Act
    renderizarConContexto('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha del comité' })).toBeInTheDocument();
    for (const nombre of [
      'Iniciar evaluación',
      'Evaluar ficha',
      'Descartar evaluación',
      'Reanudar evaluación',
    ]) {
      expect(screen.queryByRole('button', { name: nombre })).not.toBeInTheDocument();
    }
  });

  it('sin state ni snapshot redirige al listado de fichas', () => {
    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByText('Listado de fichas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Iniciar evaluación' })).not.toBeInTheDocument();
  });

  it('sin state pero con snapshot vigente pinta el detalle con el asesor', () => {
    // Arrange
    renderizarConContexto('/fichas-perfil/f-1/items').unmount();

    // Act
    renderizar('/fichas-perfil/f-1/items');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha del comité' })).toBeInTheDocument();
    expect(screen.queryByText('Listado de fichas')).not.toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
  });
});
