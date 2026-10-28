import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../test-utils/render';
import ConsultarEvaluacionesCualitativasJurado from './ConsultarEvaluacionesCualitativasJurado';
import type { ConsultaCualitativas } from './ConsultarEvaluacionesCualitativasJurado';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO,
} from '../utils/codigos-error-evaluaciones';
import type { EvaluacionCualitativaJurado } from '../models/EvaluacionCualitativaJurado';

const FILA: EvaluacionCualitativaJurado = {
  id: 'ec-1',
  item: { id: 'i-1', nombre: 'Claridad', descripcion: 'Qué tan claro es el documento' },
  criterio: { id: 'c-1', nombre: 'Excelente', descripcion: 'Supera lo esperado' },
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

function montar(parcial: Partial<ConsultaCualitativas> = {}) {
  const refetch = vi.fn();
  const onVolver = vi.fn();
  const consulta: ConsultaCualitativas = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch,
    ...parcial,
  };
  render(
    <ConsultarEvaluacionesCualitativasJurado
      consulta={consulta}
      etiquetaVolver="Volver a los jurados"
      onVolver={onVolver}
    />,
  );
  return { refetch, onVolver };
}

describe('ConsultarEvaluacionesCualitativasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista ítem y criterio con nombre y descripción y anuncia el total', () => {
    // Arrange / Act
    montar({ data: [FILA] });

    // Assert
    expect(screen.getByText('1 evaluación cualitativa')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Qué tan claro es el documento').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Excelente').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Supera lo esperado').length).toBeGreaterThan(0);
  });

  it('muestra el estado de carga', () => {
    // Arrange / Act
    montar({ isLoading: true });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay evaluaciones', () => {
    // Arrange / Act
    montar({ data: [] });

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones cualitativas')).toBeInTheDocument();
  });

  it('cada 422 muestra un error sin reintento y permite volver', async () => {
    // Arrange
    const { onVolver } = montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA),
    });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Volver a los jurados' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Esta evaluación no está disponible');
    expect(onVolver).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('el 422 de otro jurado muestra su propio mensaje sin reintento', () => {
    // Arrange / Act
    montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO),
    });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No puedes consultar esta evaluación');
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('otro error muestra el mensaje del backend y reintenta con refetch', async () => {
    // Arrange
    const { refetch } = montar({ isError: true, error: crearError(400, 'X', 'Id inválido') });

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Id inválido');
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
