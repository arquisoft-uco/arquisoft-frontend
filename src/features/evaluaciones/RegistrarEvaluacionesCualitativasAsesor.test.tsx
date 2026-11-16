import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import RegistrarEvaluacionesCualitativasAsesor from './RegistrarEvaluacionesCualitativasAsesor';
import { useEvaluacionAsignadaAsesor } from './hooks/useEvaluacionAsignadaAsesor';
import { Rol } from '../../shared/models/rol';
import type { EvaluacionAsignadaAsesor } from './models/EvaluacionAsignadaAsesor';

vi.mock('./hooks/useEvaluacionAsignadaAsesor', () => ({
  useEvaluacionAsignadaAsesor: vi.fn(),
}));
vi.mock('./components/asesor/RegistrarEvaluacionesCualitativasAsesorForm', () => ({
  default: ({
    asignacion,
    rutaListado,
  }: {
    asignacion: EvaluacionAsignadaAsesor;
    rutaListado: string;
  }) => (
    <p>
      Formulario de {asignacion.id} hacia {rutaListado}
    </p>
  ),
}));

const PENDIENTE: EvaluacionAsignadaAsesor = {
  id: 'ea-1',
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  tieneEvaluacionesCualitativas: false,
  tieneEvaluacionesCuantitativas: false,
};

const FINALIZADA: EvaluacionAsignadaAsesor = {
  id: 'ea-2',
  evaluacion: { id: 'e-2', estado: { id: 'FINALIZADA', nombre: 'Finalizada' } },
  entregable: { id: 'en-2', proyecto: 'Plataforma de riego', version: 1 },
  tieneEvaluacionesCualitativas: true,
  tieneEvaluacionesCuantitativas: true,
};

type HookAsignacion = ReturnType<typeof useEvaluacionAsignadaAsesor>;

function mockAsignacion({
  data,
  ...parcial
}: Partial<Omit<HookAsignacion, 'data'>> & { data?: EvaluacionAsignadaAsesor[] } = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as HookAsignacion;
  vi.mocked(useEvaluacionAsignadaAsesor).mockImplementation(
    (id) =>
      ({
        ...hook,
        data: data ? (data.find((a) => a.id === id) ?? null) : undefined,
      }) as HookAsignacion,
  );
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
        path="/evaluaciones/:evaluacionAsesorId/evaluar-asesor"
        element={<RegistrarEvaluacionesCualitativasAsesor />}
      />
      <Route path="/evaluaciones" element={<p>Pantalla Mis evaluaciones</p>} />
      <Route path="/forbidden" element={<p>Pantalla prohibida</p>} />
    </Routes>,
    { initialPath: `/evaluaciones/${id}/evaluar-asesor` },
  );
}

describe('RegistrarEvaluacionesCualitativasAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    autenticarCon(Rol.Asesor);
  });

  it('con rol asesor y la evaluación en su lista muestra el proyecto y el formulario', () => {
    // Arrange
    mockAsignacion({ data: [PENDIENTE, FINALIZADA] });

    // Act
    montar('ea-1');

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Evaluar proyecto' })).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getByText('Formulario de ea-1 hacia /evaluaciones')).toBeInTheDocument();
  });

  it('muestra el estado de carga y el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    mockAsignacion({ isLoading: true });
    const { unmount } = montar('ea-1');

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(/Formulario de/)).not.toBeInTheDocument();

    // Arrange
    unmount();
    const hook = mockAsignacion({ isError: true, error: new Error('fallo') });
    montar('ea-1');

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('con un id que no está entre las asignaciones muestra el vacío y permite volver a la lista', async () => {
    // Arrange
    const user = userEvent.setup();
    mockAsignacion({ data: [PENDIENTE] });
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
    mockAsignacion({ data: [FINALIZADA] });

    // Act
    montar('ea-2');

    // Assert
    expect(
      screen.getByText('La evaluación está finalizada y no admite nuevas valoraciones.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Formulario de/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver a mis evaluaciones' })).toBeInTheDocument();
  });

  it.each([Rol.Coordinador, Rol.Jurado])('con el rol %s redirige a /forbidden', (rol) => {
    // Arrange
    resetAllStores();
    autenticarCon(rol);
    mockAsignacion({ data: [PENDIENTE] });

    // Act
    montar('ea-1');

    // Assert
    expect(screen.getByText('Pantalla prohibida')).toBeInTheDocument();
    expect(screen.queryByText(/Formulario de/)).not.toBeInTheDocument();
  });
});
