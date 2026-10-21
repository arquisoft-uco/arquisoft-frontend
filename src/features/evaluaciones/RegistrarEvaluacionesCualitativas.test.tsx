import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import RegistrarEvaluacionesCualitativas from './RegistrarEvaluacionesCualitativas';
import { useEvaluacionesAsignadasJurado } from './hooks/useEvaluacionesAsignadasJurado';
import { Rol } from '../../shared/models/rol';
import type { EvaluacionAsignadaJurado } from './models/EvaluacionAsignadaJurado';

vi.mock('./hooks/useEvaluacionesAsignadasJurado', () => ({
  useEvaluacionesAsignadasJurado: vi.fn(),
}));
vi.mock('./components/jurado/RegistrarEvaluacionesCualitativasForm', () => ({
  default: ({ asignacion }: { asignacion: EvaluacionAsignadaJurado }) => (
    <p>Formulario de {asignacion.id}</p>
  ),
}));

const PENDIENTE: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
};

const FINALIZADA: EvaluacionAsignadaJurado = {
  id: 'ej-2',
  evaluacion: { id: 'e-2', estado: { id: 'FINALIZADA', nombre: 'Finalizada' } },
  entregable: { id: 'en-2', proyecto: 'Plataforma de riego', version: 1 },
};

function mockLista(parcial: Partial<ReturnType<typeof useEvaluacionesAsignadasJurado>> = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEvaluacionesAsignadasJurado>;
  vi.mocked(useEvaluacionesAsignadasJurado).mockReturnValue(hook);
  return hook;
}

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function montar(id: string) {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionJuradoId/evaluar"
        element={<RegistrarEvaluacionesCualitativas />}
      />
      <Route path="/evaluaciones" element={<p>Pantalla Mis evaluaciones</p>} />
      <Route path="/forbidden" element={<p>Pantalla prohibida</p>} />
    </Routes>,
    { initialPath: `/evaluaciones/${id}/evaluar` },
  );
}

describe('RegistrarEvaluacionesCualitativas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    autenticarCon(Rol.Jurado);
  });

  it('con rol jurado y la evaluación en su lista muestra el proyecto y el formulario', () => {
    // Arrange
    mockLista({ data: [PENDIENTE, FINALIZADA] });

    // Act
    montar('ej-1');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Evaluar proyecto' })).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getByText('Formulario de ej-1')).toBeInTheDocument();
  });

  it('muestra el estado de carga y el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    mockLista({ isLoading: true });
    const { unmount } = montar('ej-1');

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Formulario de ej-1')).not.toBeInTheDocument();

    // Arrange
    unmount();
    const hook = mockLista({ isError: true, error: new Error('fallo') });
    montar('ej-1');

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('con un id que no está entre las asignaciones muestra el vacío y permite volver a la lista', async () => {
    // Arrange
    const user = userEvent.setup();
    mockLista({ data: [PENDIENTE] });
    montar('desconocido');

    // Assert
    expect(screen.getByText('Esta evaluación no está entre tus asignaciones')).toBeInTheDocument();
    expect(screen.queryByText(/Formulario de/)).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
  });

  it('con una evaluación finalizada avisa y no muestra el formulario', () => {
    // Arrange
    mockLista({ data: [FINALIZADA] });

    // Act
    montar('ej-2');

    // Assert
    expect(
      screen.getByText('La evaluación está finalizada y no admite nuevas valoraciones.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Formulario de/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a mis evaluaciones' })).toBeInTheDocument();
  });

  it.each([Rol.Coordinador, Rol.Administrador])('con el rol %s redirige a /forbidden', (rol) => {
    // Arrange
    resetAllStores();
    autenticarCon(rol);
    mockLista({ data: [PENDIENTE] });

    // Act
    montar('ej-1');

    // Assert
    expect(screen.getByText('Pantalla prohibida')).toBeInTheDocument();
    expect(screen.queryByText(/Formulario de/)).not.toBeInTheDocument();
  });
});
