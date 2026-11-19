import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ConsultarEvaluacionesCualitativasAsesorEstudiante from './ConsultarEvaluacionesCualitativasAsesorEstudiante';
import { useEvaluacionesCualitativasAsesorEstudiante } from '../../hooks/useEvaluacionesCualitativasAsesorEstudiante';
import {
  EVALUACION_ASESOR_NO_PERTENECE_ESTUDIANTE,
  EVALUACION_CUALITATIVA_ASESOR_EVALUACION_ASESOR_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';
import type { EvaluacionCualitativaAsesor } from '../../models/EvaluacionCualitativaAsesor';

vi.mock('../../hooks/useEvaluacionesCualitativasAsesorEstudiante', () => ({
  useEvaluacionesCualitativasAsesorEstudiante: vi.fn(),
}));

const FILA: EvaluacionCualitativaAsesor = {
  id: 'ec-1',
  item: { id: 'i-1', nombre: 'Claridad', descripcion: 'Qué tan claro es el documento' },
  criterio: { id: 'cr-1', nombre: 'Sobresaliente', descripcion: 'Cumple todo lo esperado' },
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
  vi.mocked(useEvaluacionesCualitativasAsesorEstudiante).mockReturnValue({
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
    <ConsultarEvaluacionesCualitativasAsesorEstudiante
      evaluacionAsesorId="ea-1"
      onVolver={onVolver}
    />,
  );
  return onVolver;
}

describe('ConsultarEvaluacionesCualitativasAsesorEstudiante', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista ítem y criterio con su descripción y anuncia el total en singular y plural', () => {
    // Arrange
    mockHook({ data: [FILA] });

    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('heading', { name: 'Evaluaciones cualitativas del asesor' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Evaluaciones cualitativas del asesor' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 evaluación cualitativa')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Qué tan claro es el documento').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sobresaliente').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cumple todo lo esperado').length).toBeGreaterThan(0);
  });

  it('anuncia el total en plural con varias evaluaciones', () => {
    // Arrange
    mockHook({ data: [FILA, { ...FILA, id: 'ec-2' }] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('2 evaluaciones cualitativas')).toBeInTheDocument();
  });

  it('muestra el estado de carga sin vacío ni conteo', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.queryByText('Aún no hay evaluaciones cualitativas del asesor'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/evaluaciones? cualitativas?$/)).not.toBeInTheDocument();
  });

  it('muestra el estado vacío, que no es un error, cuando no hay evaluaciones', () => {
    // Arrange
    mockHook({ data: [] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones cualitativas del asesor')).toBeInTheDocument();
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
