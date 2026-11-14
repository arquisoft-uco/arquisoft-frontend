import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { cleanup, render, screen } from '../../../test-utils/render';
import ConsultarEvaluacionesCuantitativasRealizadasJurado from './ConsultarEvaluacionesCuantitativasRealizadasJurado';
import type { ConsultaCuantitativas } from './ConsultarEvaluacionesCuantitativasRealizadasJurado';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO,
} from '../utils/codigos-error-evaluaciones';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';

const FILA: EvaluacionCuantitativaJurado = {
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

const OTRA_FILA: EvaluacionCuantitativaJurado = {
  ...FILA,
  id: 'ec-2',
  puntaje: 10,
  item: { ...FILA.item, id: 'i-2', nombre: 'Rigor' },
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

function montar(parcial: Partial<ConsultaCuantitativas> = {}, conEvaluar = false) {
  const refetch = vi.fn();
  const onVolver = vi.fn();
  const onEvaluar = vi.fn();
  const consulta: ConsultaCuantitativas = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch,
    ...parcial,
  };
  render(
    <ConsultarEvaluacionesCuantitativasRealizadasJurado
      consulta={consulta}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={onVolver}
      onEvaluar={conEvaluar ? onEvaluar : undefined}
    />,
  );
  return { refetch, onVolver, onEvaluar };
}

describe('ConsultarEvaluacionesCuantitativasRealizadasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista ítem y puntaje de valor máximo y anuncia el total en singular y plural', () => {
    // Arrange / Act
    montar({ data: [FILA] });

    // Assert
    expect(screen.getByText('1 evaluación cuantitativa')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('40 de 50').length).toBeGreaterThan(0);

    // Act
    cleanup();
    montar({ data: [FILA, OTRA_FILA] });

    // Assert
    expect(screen.getByText('2 evaluaciones cuantitativas')).toBeInTheDocument();
  });

  it('muestra el estado de carga', () => {
    // Arrange / Act
    montar({ isLoading: true });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con lista vacía ofrece «Evaluar cuantitativas» solo si hay onEvaluar', async () => {
    // Arrange
    montar({ data: [] });

    // Assert
    expect(screen.getByText('Aún no registraste evaluaciones cuantitativas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Evaluar cuantitativas' })).not.toBeInTheDocument();

    // Arrange
    cleanup();
    const { onEvaluar } = montar({ data: [] }, true);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Evaluar cuantitativas' }));

    // Assert
    expect(onEvaluar).toHaveBeenCalledTimes(1);
  });

  it('el 422 de evaluación inexistente muestra su error sin reintento y permite volver', async () => {
    // Arrange
    const { onVolver } = montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA),
    });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

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
