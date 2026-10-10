import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import CoordinadorDetalleView from './CoordinadorDetalleView';

vi.mock('../hooks/useEvaluacionesFichaCoordinador', () => ({
  useEvaluacionesFichaCoordinador: vi.fn(() => ({ data: [], isLoading: false })),
}));

const RESUMEN = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  estadoId: 'e-1',
  estadoNombre: 'En revisión',
  asesorNombre: 'Ana Pérez',
  asesorEmail: 'ana@uco.edu.co',
};

function Origen() {
  return (
    <Link to="/fichas-perfil/f-1/evaluaciones" state={{ resumen: RESUMEN, search: '?q=sis' }}>
      Abrir
    </Link>
  );
}

function renderizar(rutaInicial: string) {
  return render(
    <Routes>
      <Route path="/origen" element={<Origen />} />
      <Route path="/fichas-perfil/:id" element={<CoordinadorDetalleView />}>
        <Route path="items" element={<div>Panel ítems</div>} />
        <Route path="evaluaciones" element={<div>Panel evaluaciones</div>} />
      </Route>
    </Routes>,
    { initialPath: rutaInicial },
  );
}

describe('CoordinadorDetalleView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
  });

  it('con el state del listado muestra título, estado y asesor, tres pestañas y ninguna acción', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/origen');

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sistema de monitoreo' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('En revisión').length).toBeGreaterThan(0);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(
      within(screen.getByRole('navigation', { name: 'Secciones de la ficha' }))
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['Ítems', 'Estados', 'Evaluaciones']);
    expect(screen.getByText('Panel evaluaciones')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Fichas de perfil' })).toHaveAttribute(
      'href',
      '/fichas-perfil?q=sis',
    );
  });

  it('sin state muestra el título genérico', () => {
    // Act
    renderizar('/fichas-perfil/f-1/evaluaciones');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Ficha de perfil' })).toBeInTheDocument();
  });
});
