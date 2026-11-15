import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import EvaluacionesCuantitativasAsesor from './EvaluacionesCuantitativasAsesor';
import { useEvaluacionesCuantitativasAsesor } from './hooks/useEvaluacionesCuantitativasAsesor';
import { useNavegacionCuantitativasAsesor } from './hooks/useNavegacionCuantitativasAsesor';

vi.mock('./hooks/useEvaluacionesCuantitativasAsesor', () => ({
  useEvaluacionesCuantitativasAsesor: vi.fn(),
}));
vi.mock('./hooks/useNavegacionCuantitativasAsesor', () => ({
  useNavegacionCuantitativasAsesor: vi.fn(),
}));

type Consulta = ReturnType<typeof useEvaluacionesCuantitativasAsesor>;

const FILA = {
  id: 'ec-1',
  puntaje: 80,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: 'cat-1',
    valor: 100,
  },
};

function autenticarCon(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'user-id', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

function mockConsulta(parcial: Partial<Consulta>) {
  vi.mocked(useEvaluacionesCuantitativasAsesor).mockReturnValue({
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
        path="/evaluaciones/:evaluacionAsesorId/cuantitativas-asesor"
        element={<EvaluacionesCuantitativasAsesor />}
      />
      <Route path="/evaluaciones" element={<p>Pantalla Mis evaluaciones</p>} />
      <Route path="/forbidden" element={<p>Pantalla prohibida</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/ea-1/cuantitativas-asesor' },
  );
}

describe('EvaluacionesCuantitativasAsesor', () => {
  beforeEach(() => {
    resetAllStores();
    mockConsulta({ data: [FILA] });
    vi.mocked(useNavegacionCuantitativasAsesor).mockReturnValue({
      evaluacionAsesorId: 'ea-1',
      search: '?q=sis',
      resumen: { proyecto: 'Sistema de monitoreo', version: 2 },
    });
  });

  it('un rol distinto de asesor es enviado a /forbidden', () => {
    // Arrange
    autenticarCon(Rol.Jurado);

    // Act
    montar();

    // Assert
    expect(screen.getByText('Pantalla prohibida')).toBeInTheDocument();
    expect(screen.queryByText('Claridad')).not.toBeInTheDocument();
  });

  it('el asesor ve el encabezado con proyecto y versión y la lista', () => {
    // Arrange
    autenticarCon(Rol.Asesor);

    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Evaluaciones cuantitativas realizadas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
  });

  it('sin state usa la descripción genérica y «Volver» regresa al listado', async () => {
    // Arrange
    const user = userEvent.setup();
    autenticarCon(Rol.Asesor);
    vi.mocked(useNavegacionCuantitativasAsesor).mockReturnValue(null);
    mockConsulta({ isError: true, error: new Error('fallo') });
    montar();

    // Assert
    expect(
      screen.getByText('Consulta las valoraciones cuantitativas que registraste.'),
    ).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
  });
});
