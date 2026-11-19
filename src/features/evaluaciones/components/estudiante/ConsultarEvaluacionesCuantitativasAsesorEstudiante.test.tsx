import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ConsultarEvaluacionesCuantitativasAsesorEstudiante from './ConsultarEvaluacionesCuantitativasAsesorEstudiante';
import { useEvaluacionesCuantitativasAsesorEstudiante } from '../../hooks/useEvaluacionesCuantitativasAsesorEstudiante';
import {
  EVALUACION_ASESOR_NO_PERTENECE_ESTUDIANTE,
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';

vi.mock('../../hooks/useEvaluacionesCuantitativasAsesorEstudiante', () => ({
  useEvaluacionesCuantitativasAsesorEstudiante: vi.fn(),
}));

const FILA: EvaluacionCuantitativaAsesor = {
  id: 'ec-1',
  puntaje: 4,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: 'c-1',
    valor: 5,
  },
};

vi.mock('./ObservacionesEvaluacionCuantitativaAsesorEstudiantePanel', () => ({
  default: ({
    evaluacion,
    onCerrar,
  }: {
    evaluacion: { item: { nombre: string } };
    onCerrar: () => void;
  }) => (
    <div role="dialog" aria-label={`Panel de ${evaluacion.item.nombre}`}>
      <button type="button" onClick={onCerrar}>
        Cerrar panel simulado
      </button>
    </div>
  ),
}));

function crearError(status: number, errorCode?: string, message = 'Falla del servidor') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, errorCode, message },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function mockHook(parcial: Record<string, unknown> = {}) {
  const refetch = vi.fn();
  vi.mocked(useEvaluacionesCuantitativasAsesorEstudiante).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch,
    ...parcial,
  } as never);
  return refetch;
}

function montar() {
  const onVolver = vi.fn();
  render(
    <ConsultarEvaluacionesCuantitativasAsesorEstudiante
      evaluacionAsesorId="ea-1"
      onVolver={onVolver}
    />,
  );
  return onVolver;
}

describe('ConsultarEvaluacionesCuantitativasAsesorEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista ítem con nombre, descripción y puntaje sobre el valor, y anuncia el total', () => {
    // Arrange
    mockHook({ data: [FILA] });

    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Evaluaciones cuantitativas del asesor' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Evaluaciones cuantitativas del asesor' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 evaluación cuantitativa')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Qué tan claro es el documento').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4 de 5').length).toBeGreaterThan(0);
  });

  it('cada fila ofrece «Ver observaciones», que abre el panel de esa fila y se cierra', async () => {
    // Arrange
    mockHook({ data: [FILA] });
    montar();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Ver observaciones de Claridad' })[0],
    );

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de Claridad' })).toBeInTheDocument();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar panel simulado' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el estado de carga sin vacío ni conteo', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByText('Aún no hay evaluaciones cuantitativas del asesor'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/evaluaciones? cuantitativas?$/)).not.toBeInTheDocument();
  });

  it('muestra el estado vacío, que no es un error, cuando no hay evaluaciones', () => {
    // Arrange
    mockHook({ data: [] });

    // Act
    montar();

    // Assert
    expect(
      screen.getByText('Aún no hay evaluaciones cuantitativas del asesor'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('un 422 de evaluación del asesor inexistente muestra no disponible, permite volver y no reintenta', async () => {
    // Arrange
    mockHook({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA),
    });
    const onVolver = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Volver a evaluaciones' }));

    // Assert
    expect(screen.getByText('Esta evaluación del asesor no está disponible')).toBeInTheDocument();
    expect(onVolver).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('un 422 de pertenencia muestra que no puede consultarla, permite volver y no reintenta', async () => {
    // Arrange
    mockHook({
      isError: true,
      error: crearError(422, EVALUACION_ASESOR_NO_PERTENECE_ESTUDIANTE),
    });
    const onVolver = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Volver a evaluaciones' }));

    // Assert
    expect(screen.getByText('No puedes consultar esta evaluación')).toBeInTheDocument();
    expect(onVolver).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('otro error muestra el mensaje del backend y reintenta con refetch', async () => {
    // Arrange
    const refetch = mockHook({ isError: true, error: crearError(400, 'X', 'Id inválido') });
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Id inválido');
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
