import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ObservacionesEvaluacionCuantitativaAsesorEstudiantePanel from './ObservacionesEvaluacionCuantitativaAsesorEstudiantePanel';
import { useObservacionesEvaluacionCuantitativaAsesorEstudiante } from '../../hooks/useObservacionesEvaluacionCuantitativaAsesorEstudiante';
import {
  EVALUACION_ASESOR_NO_PERTENECE_ESTUDIANTE,
  OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA,
} from '../../utils/codigos-error-evaluaciones';
import type { EvaluacionCuantitativaAsesor } from '../../models/EvaluacionCuantitativaAsesor';

vi.mock('../../hooks/useObservacionesEvaluacionCuantitativaAsesorEstudiante', () => ({
  useObservacionesEvaluacionCuantitativaAsesorEstudiante: vi.fn(),
}));

const usarHook = vi.mocked(useObservacionesEvaluacionCuantitativaAsesorEstudiante);

const EVALUACION: EvaluacionCuantitativaAsesor = {
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

function pagina(descripciones: string[], totalPages = 1) {
  return {
    content: descripciones.map((descripcion, i) => ({ id: `o-${i}`, descripcion })),
    totalElements: descripciones.length,
    totalPages,
    number: 0,
    size: 10,
  };
}

function montar(estado: Record<string, unknown> = {}) {
  const refetch = vi.fn();
  const onCerrar = vi.fn();
  const goToPage = vi.fn();
  usarHook.mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch,
    page: 0,
    pageSize: 10,
    goToPage,
    ...estado,
  } as never);
  render(
    <ObservacionesEvaluacionCuantitativaAsesorEstudiantePanel
      evaluacion={EVALUACION}
      onCerrar={onCerrar}
    />,
  );
  return { refetch, onCerrar, goToPage };
}

describe('ObservacionesEvaluacionCuantitativaAsesorEstudiantePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta por el id de la evaluación, lista las observaciones con el resumen en plural y es de solo lectura', () => {
    // Arrange / Act
    montar({ data: pagina(['Falta rigor', 'Buena redacción']) });

    // Assert
    expect(usarHook).toHaveBeenCalledWith('ec-1');
    expect(screen.getByText('2 observaciones')).toBeInTheDocument();
    expect(screen.getAllByText('Falta rigor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Buena redacción').length).toBeGreaterThan(0);
    expect(screen.getByText(/Claridad · 40 de 50/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Modificar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remover/ })).not.toBeInTheDocument();
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
      error: crearError(422, OBSERVACION_ITEM_ASESOR_EVALUACION_NO_ENCONTRADA),
    });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Esta evaluación no está disponible');
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('el 422 de pertenencia indica que no puede consultarlas y no ofrece reintento', () => {
    // Arrange / Act
    montar({
      isError: true,
      error: crearError(422, EVALUACION_ASESOR_NO_PERTENECE_ESTUDIANTE),
    });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No puedes consultar estas observaciones');
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('el paginador pide la página siguiente con goToPage', async () => {
    // Arrange
    const { goToPage } = montar({ data: pagina(['Falta rigor'], 3) });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));

    // Assert
    expect(goToPage).toHaveBeenCalledWith(1);
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
