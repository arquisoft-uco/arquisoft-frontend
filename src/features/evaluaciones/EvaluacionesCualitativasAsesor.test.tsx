import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../test-utils/render';
import { resetAllStores, setActiveRole, setAuthenticatedUser } from '../../test-utils/store.utils';
import { Rol } from '../../shared/models/rol';
import EvaluacionesCualitativasAsesor from './EvaluacionesCualitativasAsesor';
import { useEvaluacionesCualitativasAsesor } from './hooks/useEvaluacionesCualitativasAsesor';
import { useNavegacionCualitativasAsesor } from './hooks/useNavegacionCualitativasAsesor';

vi.mock('./hooks/useEvaluacionesCualitativasAsesor', () => ({
  useEvaluacionesCualitativasAsesor: vi.fn(),
}));
vi.mock('./hooks/useNavegacionCualitativasAsesor', () => ({
  useNavegacionCualitativasAsesor: vi.fn(),
}));

type Consulta = ReturnType<typeof useEvaluacionesCualitativasAsesor>;

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
  vi.mocked(useEvaluacionesCualitativasAsesor).mockReturnValue({
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
        path="/evaluaciones/:evaluacionAsesorId/cualitativas-asesor"
        element={<EvaluacionesCualitativasAsesor />}
      />
      <Route path="/evaluaciones" element={<p>Pantalla Mis evaluaciones</p>} />
      <Route path="/forbidden" element={<p>Pantalla prohibida</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/ea-1/cualitativas-asesor' },
  );
}

describe('EvaluacionesCualitativasAsesor', () => {
  beforeEach(() => {
    resetAllStores();
    mockConsulta({ data: [FILA] });
    vi.mocked(useNavegacionCualitativasAsesor).mockReturnValue({
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
      screen.getByRole('heading', { name: 'Evaluaciones cualitativas realizadas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
  });

  it('sin state usa la descripción genérica y «Volver» regresa al listado', async () => {
    // Arrange
    const user = userEvent.setup();
    autenticarCon(Rol.Asesor);
    vi.mocked(useNavegacionCualitativasAsesor).mockReturnValue(null);
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
