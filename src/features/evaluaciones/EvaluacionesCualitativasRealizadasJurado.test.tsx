import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import EvaluacionesCualitativasRealizadasJurado from './EvaluacionesCualitativasRealizadasJurado';
import { useEvaluacionesCualitativasRealizadasJurado } from './hooks/useEvaluacionesCualitativasRealizadasJurado';
import { useNavegacionCualitativasRealizadasJurado } from './hooks/useNavegacionCualitativasRealizadasJurado';

vi.mock('./hooks/useEvaluacionesCualitativasRealizadasJurado', () => ({
  useEvaluacionesCualitativasRealizadasJurado: vi.fn(),
}));
vi.mock('./hooks/useNavegacionCualitativasRealizadasJurado', () => ({
  useNavegacionCualitativasRealizadasJurado: vi.fn(),
}));

type Consulta = ReturnType<typeof useEvaluacionesCualitativasRealizadasJurado>;

const FILA = {
  id: 'ec-1',
  item: { id: 'i-1', nombre: 'Claridad', descripcion: 'Qué tan claro es el documento' },
  criterio: { id: 'c-1', nombre: 'Excelente', descripcion: 'Supera lo esperado' },
};

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function mockConsulta(parcial: Partial<Consulta>) {
  vi.mocked(useEvaluacionesCualitativasRealizadasJurado).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as Consulta);
}

function montar() {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionJuradoId/cualitativas-realizadas"
        element={<EvaluacionesCualitativasRealizadasJurado />}
      />
      <Route path="/evaluaciones" element={<p>Pantalla Mis evaluaciones</p>} />
      <Route path="/forbidden" element={<p>Pantalla prohibida</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/ej-1/cualitativas-realizadas' },
  );
}

describe('EvaluacionesCualitativasRealizadasJurado', () => {
  beforeEach(() => {
    resetAllStores();
    mockConsulta({ data: [FILA] });
    vi.mocked(useNavegacionCualitativasRealizadasJurado).mockReturnValue({
      evaluacionJuradoId: 'ej-1',
      search: '?q=sis',
      resumen: { proyecto: 'Sistema de monitoreo', version: 2 },
    });
  });

  it('un rol distinto de jurado es enviado a /forbidden', () => {
    // Arrange
    autenticarCon(Rol.Coordinador);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Pantalla prohibida')).toBeInTheDocument();
    expect(screen.queryByText('Claridad')).not.toBeInTheDocument();
  });

  it('el jurado ve el encabezado con proyecto y versión y la lista de cualitativas', () => {
    // Arrange
    autenticarCon(Rol.Jurado);

    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Evaluaciones cualitativas realizadas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
  });

  it('sin state usa la descripción genérica y «Volver» regresa al listado', async () => {
    // Arrange
    const user = userEvent.setup();
    autenticarCon(Rol.Jurado);
    vi.mocked(useNavegacionCualitativasRealizadasJurado).mockReturnValue(null);
    mockConsulta({ isError: true, error: new Error('fallo') });
    montar();

    // Assert
    expect(
      screen.getByText('Consulta las valoraciones cualitativas que registraste.'),
    ).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
  });
});
