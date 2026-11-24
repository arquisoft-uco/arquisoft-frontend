import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen } from '../../../test-utils/render';
import type { EvaluacionAsignadaAsesor } from '../models/EvaluacionAsignadaAsesor';
import { useEvaluacionAsignadaJurado } from '../hooks/useEvaluacionAsignadaJurado';
import type { EvaluacionAsignadaJurado } from '../models/EvaluacionAsignadaJurado';
import GestionEvaluacionMarco from './GestionEvaluacionMarco';

vi.mock('../hooks/useEvaluacionAsignadaJurado', () => ({
  useEvaluacionAsignadaJurado: vi.fn(),
}));

const ASIGNACION: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  estado: { id: 'PENDIENTE_POR_EVALUAR', nombre: 'Pendiente por evaluar' },
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  tieneEvaluacionesCualitativas: false,
  tieneEvaluacionesCuantitativas: false,
  notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
};

type Consulta = ReturnType<typeof useEvaluacionAsignadaJurado>;

function mockConsulta(parcial: Partial<Consulta>) {
  const consulta = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as Consulta;
  vi.mocked(useEvaluacionAsignadaJurado).mockReturnValue(consulta);
  return consulta;
}

function Listado() {
  return <p>Listado {useLocation().search}</p>;
}

function montar() {
  render(
    <Routes>
      <Route
        path="/evaluaciones/:id/gestionar"
        element={
          <GestionEvaluacionMarco
            titulo="Gestionar evaluaciones"
            asignacionId="ej-1"
            usarAsignacion={useEvaluacionAsignadaJurado}
          >
            {(_asignacion, onVolver) => (
              <button type="button" onClick={onVolver}>
                Contenido
              </button>
            )}
          </GestionEvaluacionMarco>
        }
      />
      <Route path="/evaluaciones" element={<Listado />} />
    </Routes>,
    { initialPath: '/evaluaciones/ej-1/gestionar?page=2' },
  );
}

describe('GestionEvaluacionMarco', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionAsignadaJurado).mockReset();
  });

  it('mientras carga muestra el título y un estado de carga accesible', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('heading', { level: 1, name: 'Gestionar evaluaciones' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status', { busy: true })).toHaveTextContent('Cargando la evaluación');
  });

  it('con la asignación muestra proyecto y versión, migas con la búsqueda del listado y el contenido', async () => {
    // Arrange
    const user = userEvent.setup();
    mockConsulta({ data: ASIGNACION });
    montar();

    // Assert
    expect(screen.getByText('Sistema de monitoreo · versión 2')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones?page=2',
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Contenido' }));

    // Assert
    expect(screen.getByText('Listado ?page=2')).toBeInTheDocument();
  });

  it('si falla muestra el error con «Reintentar»', async () => {
    // Arrange
    const user = userEvent.setup();
    const consulta = mockConsulta({ isError: true, error: new Error('x') });
    montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar la evaluación');
    expect(consulta.refetch).toHaveBeenCalledTimes(1);
  });

  it('si la asignación no existe ofrece volver a la lista restaurando la búsqueda', async () => {
    // Arrange
    const user = userEvent.setup();
    mockConsulta({ data: null });
    montar();
    expect(screen.getByText('Esta evaluación no está entre tus asignaciones')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(screen.getByText('Listado ?page=2')).toBeInTheDocument();
  });

  it('sirve también a las asignaciones del asesor con el hook que recibe', () => {
    // Arrange
    const asignacion: EvaluacionAsignadaAsesor = {
      id: 'ea-1',
      evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
      entregable: { id: 'en-1', proyecto: 'Proyecto del asesor', version: 3 },
      tieneEvaluacionesCualitativas: false,
      tieneEvaluacionesCuantitativas: false,
      notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
    };

    // Act
    render(
      <GestionEvaluacionMarco
        titulo="Gestionar evaluaciones"
        asignacionId="ea-1"
        usarAsignacion={() => ({
          data: asignacion,
          isLoading: false,
          isError: false,
          error: null,
          refetch: vi.fn(),
        })}
      >
        {({ id }) => <p>Contenido de {id}</p>}
      </GestionEvaluacionMarco>,
    );

    // Assert
    expect(screen.getByText('Proyecto del asesor · versión 3')).toBeInTheDocument();
    expect(screen.getByText('Contenido de ea-1')).toBeInTheDocument();
  });
});
