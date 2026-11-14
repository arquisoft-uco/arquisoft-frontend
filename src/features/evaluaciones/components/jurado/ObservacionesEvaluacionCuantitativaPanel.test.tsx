import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ObservacionesEvaluacionCuantitativaPanel from './ObservacionesEvaluacionCuantitativaPanel';
import { useObservacionesEvaluacionCuantitativaJurado } from '../../hooks/useObservacionesEvaluacionCuantitativaJurado';
import { OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA } from '../../utils/codigos-error-evaluaciones';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';

vi.mock('../../hooks/useObservacionesEvaluacionCuantitativaJurado', () => ({
  useObservacionesEvaluacionCuantitativaJurado: vi.fn(),
}));

const usarHook = vi.mocked(useObservacionesEvaluacionCuantitativaJurado);

const EVALUACION: EvaluacionCuantitativaJurado = {
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

function crearError(status: number, errorCode?: string, message = 'Falla del servidor') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, errorCode, message },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function pagina(descripciones: string[]) {
  return {
    content: descripciones.map((descripcion, i) => ({ id: `o-${i}`, descripcion })),
    totalElements: descripciones.length,
    totalPages: 1,
    number: 0,
    size: 10,
  };
}

function montar(estado: Record<string, unknown> = {}) {
  const refetch = vi.fn();
  const onCerrar = vi.fn();
  usarHook.mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    ...estado,
  } as never);
  render(<ObservacionesEvaluacionCuantitativaPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);
  return { refetch, onCerrar };
}

describe('ObservacionesEvaluacionCuantitativaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta por el id de la valoración y lista cada observación con el resumen en plural', () => {
    // Arrange / Act
    montar({ data: pagina(['Falta rigor', 'Buena redacción']) });

    // Assert
    expect(usarHook).toHaveBeenCalledWith('ec-1');
    expect(screen.getByText('2 observaciones')).toBeInTheDocument();
    expect(screen.getAllByText('Falta rigor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Buena redacción').length).toBeGreaterThan(0);
    expect(screen.getByText(/Claridad · 40 de 50/)).toBeInTheDocument();
  });

  it('sin observaciones muestra el vacío y no el paginador', () => {
    // Arrange / Act
    montar({ data: pagina([]) });

    // Assert
    expect(screen.getByText('Aún no hay observaciones')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('muestra el estado de carga', () => {
    // Arrange / Act
    montar({ isLoading: true });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('un error genérico muestra el mensaje y «Reintentar» llama a refetch', async () => {
    // Arrange
    const { refetch } = montar({ isError: true, error: crearError(500, 'X', 'Servidor caído') });

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Servidor caído');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('el 422 de evaluación inexistente no ofrece reintento', () => {
    // Arrange / Act
    montar({
      isError: true,
      error: crearError(422, OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA),
    });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Esta evaluación no está disponible');
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('«Cerrar panel» llama a onCerrar', async () => {
    // Arrange
    const { onCerrar } = montar({ data: pagina([]) });

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Cerrar panel/ }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
