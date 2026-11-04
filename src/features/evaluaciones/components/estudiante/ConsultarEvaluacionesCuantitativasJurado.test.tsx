import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ConsultarEvaluacionesCuantitativasJurado from './ConsultarEvaluacionesCuantitativasJurado';
import { useEvaluacionesCuantitativasJurado } from '../../hooks/useEvaluacionesCuantitativasJurado';
import { EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA } from '../../utils/codigos-error-evaluaciones';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';

vi.mock('../../hooks/useEvaluacionesCuantitativasJurado', () => ({
  useEvaluacionesCuantitativasJurado: vi.fn(),
}));

const FILA: EvaluacionCuantitativaJurado = {
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
  vi.mocked(useEvaluacionesCuantitativasJurado).mockReturnValue({
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
    <ConsultarEvaluacionesCuantitativasJurado evaluacionJuradoId="ej-1" onVolver={onVolver} />,
  );
  return onVolver;
}

describe('ConsultarEvaluacionesCuantitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista ítem con nombre, descripción y puntaje sobre el valor, y anuncia el total', () => {
    // Arrange
    mockHook({ data: [FILA] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('1 evaluación cuantitativa')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Qué tan claro es el documento').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4 de 5').length).toBeGreaterThan(0);
  });

  it('muestra el estado de carga', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay evaluaciones', () => {
    // Arrange
    mockHook({ data: [] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones cuantitativas')).toBeInTheDocument();
  });

  it('un 422 de jurado no encontrado muestra no disponible, permite volver y no ofrece reintento', async () => {
    // Arrange
    mockHook({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA),
    });
    const onVolver = montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Volver a los jurados' }));

    // Assert
    expect(screen.getByText('Esta evaluación del jurado no está disponible')).toBeInTheDocument();
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
