import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import EvaluacionesCuantitativasRealizadasJurado from './EvaluacionesCuantitativasRealizadasJurado';
import { useEvaluacionesCuantitativasRealizadasJurado } from './hooks/useEvaluacionesCuantitativasRealizadasJurado';
import { useNavegacionCuantitativasRealizadasJurado } from './hooks/useNavegacionCuantitativasRealizadasJurado';

vi.mock('./hooks/useEvaluacionesCuantitativasRealizadasJurado', () => ({
  useEvaluacionesCuantitativasRealizadasJurado: vi.fn(),
}));
vi.mock('./hooks/useNavegacionCuantitativasRealizadasJurado', () => ({
  useNavegacionCuantitativasRealizadasJurado: vi.fn(),
}));

type Consulta = ReturnType<typeof useEvaluacionesCuantitativasRealizadasJurado>;

const FILA = {
  id: 'ec-1',
  puntaje: 40,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: 'c-1',
    valor: 50,
  },
};

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function mockConsulta(parcial: Partial<Consulta>) {
  vi.mocked(useEvaluacionesCuantitativasRealizadasJurado).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as Consulta);
}

function mockNavegacion(evaluacionFinalizada: boolean) {
  vi.mocked(useNavegacionCuantitativasRealizadasJurado).mockReturnValue({
    evaluacionJuradoId: 'ej-1',
    search: '?q=sis',
    evaluacionFinalizada,
    resumen: { proyecto: 'Sistema de monitoreo', version: 2 },
  });
}

let ubicacion = '';
function Listado() {
  const location = useLocation();
  ubicacion = location.pathname + location.search;
  return <p>Pantalla Mis evaluaciones</p>;
}

function montar() {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionJuradoId/cuantitativas-realizadas"
        element={<EvaluacionesCuantitativasRealizadasJurado />}
      />
      <Route path="/evaluaciones" element={<Listado />} />
      <Route path="/evaluaciones/:id/evaluar-cuantitativas" element={<p>Pantalla evaluar</p>} />
      <Route path="/forbidden" element={<p>Pantalla prohibida</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/ej-1/cuantitativas-realizadas' },
  );
}

describe('EvaluacionesCuantitativasRealizadasJurado', () => {
  beforeEach(() => {
    resetAllStores();
    ubicacion = '';
    mockConsulta({ data: [FILA] });
    mockNavegacion(false);
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

  it('el jurado ve el encabezado con proyecto y versión y la lista de puntajes', () => {
    // Arrange
    autenticarCon(Rol.Jurado);

    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Evaluaciones cuantitativas realizadas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getAllByText('40 de 50').length).toBeGreaterThan(0);
  });

  it('sin state usa la descripción genérica y «Volver» regresa al listado', async () => {
    // Arrange
    const user = userEvent.setup();
    autenticarCon(Rol.Jurado);
    vi.mocked(useNavegacionCuantitativasRealizadasJurado).mockReturnValue(null);
    mockConsulta({ isError: true, error: new Error('fallo') });
    montar();

    // Assert
    expect(screen.getByText('Consulta los puntajes que registraste.')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
    expect(ubicacion).toBe('/evaluaciones');
  });

  it('con la evaluación sin finalizar el vacío ofrece evaluar y navega a evaluar-cuantitativas', async () => {
    // Arrange
    const user = userEvent.setup();
    autenticarCon(Rol.Jurado);
    mockConsulta({ data: [] });
    montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Evaluar cuantitativas' }));

    // Assert
    expect(await screen.findByText('Pantalla evaluar')).toBeInTheDocument();
  });

  it('con la evaluación finalizada no ofrece evaluar y «Volver» conserva el search', async () => {
    // Arrange
    const user = userEvent.setup();
    autenticarCon(Rol.Jurado);
    mockNavegacion(true);
    mockConsulta({ data: [] });
    montar();

    // Assert
    expect(screen.queryByRole('button', { name: 'Evaluar cuantitativas' })).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('link', { name: 'Evaluaciones' }));

    // Assert
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
    expect(ubicacion).toBe('/evaluaciones?q=sis');
  });
});
