import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores } from '../../../test-utils/store.utils';
import { useHistorialEstadosFichaCoordinador } from '../hooks/useHistorialEstadosFichaCoordinador';
import CoordinadorDetalleView from './CoordinadorDetalleView';

vi.mock('../hooks/useHistorialEstadosFichaCoordinador', () => ({
  useHistorialEstadosFichaCoordinador: vi.fn(),
}));
vi.mock('./coordinador/DecisionFichaPanel', () => ({
  default: () => <section aria-label="Decisión sobre la ficha" />,
}));
vi.mock('./coordinador/EstudiantesVinculadosPanel', () => ({ default: () => null }));
vi.mock('./coordinador/CambiarAsesorPanel', () => ({
  default: ({
    onAsesorCambiado,
  }: {
    onAsesorCambiado: (a: { id: string; nombre: string; email: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onAsesorCambiado({ id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' })
      }
    >
      Simular cambio de asesor
    </button>
  ),
}));

const RESUMEN = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  estadoId: 'e-1',
  estadoNombre: 'En revisión',
  asesorId: 'a-1',
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

function simularHistorial(data: unknown) {
  vi.mocked(useHistorialEstadosFichaCoordinador).mockReturnValue({ data } as never);
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
    simularHistorial(undefined);
  });

  it('con el state del listado muestra título, estado y asesor, tres pestañas y las acciones de la ficha', async () => {
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
    expect(screen.getByRole('button', { name: 'Ver estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar asesor' })).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Decisión sobre la ficha' }),
    ).not.toBeInTheDocument();
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
    expect(screen.queryByRole('button', { name: 'Ver estudiantes' })).not.toBeInTheDocument();
  });

  it('muestra la tarjeta de decisión aparte de las acciones cuando el historial indica que la ficha está disponible para evaluación', async () => {
    // Arrange
    const user = userEvent.setup();
    simularHistorial([
      {
        id: 'DISPONIBLE_PARA_EVALUACION',
        nombre: 'Disponible para evaluación',
        fechaActualizacion: '2026-10-02T10:00:00',
      },
    ]);
    renderizar('/origen');

    // Act
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Assert
    expect(screen.getByRole('region', { name: 'Decisión sobre la ficha' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver estudiantes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar asesor' })).toBeInTheDocument();
  });

  it('tras cambiar el asesor el panel muestra al asesor nuevo', async () => {
    // Arrange
    const user = userEvent.setup();
    renderizar('/origen');
    await user.click(screen.getByRole('link', { name: 'Abrir' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));
    await user.click(screen.getByRole('button', { name: 'Simular cambio de asesor' }));

    // Assert
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument();
  });
});
