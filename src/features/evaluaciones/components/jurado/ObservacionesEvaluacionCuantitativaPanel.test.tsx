import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, within } from '../../../../test-utils/render';
import ObservacionesEvaluacionCuantitativaPanel from './ObservacionesEvaluacionCuantitativaPanel';
import { useObservacionesEvaluacionCuantitativaJurado } from '../../hooks/useObservacionesEvaluacionCuantitativaJurado';
import { useRemoverObservacionItemJurado } from '../../hooks/useRemoverObservacionItemJurado';
import { OBSERVACION_ITEM_JURADO_EVALUACION_NO_ENCONTRADA } from '../../utils/codigos-error-evaluaciones';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';

vi.mock('../../hooks/useObservacionesEvaluacionCuantitativaJurado', () => ({
  useObservacionesEvaluacionCuantitativaJurado: vi.fn(),
}));
vi.mock('../../hooks/useRemoverObservacionItemJurado', () => ({
  useRemoverObservacionItemJurado: vi.fn(),
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

function montar(
  estado: Record<string, unknown> = {},
  modificacion: {
    puedeModificar?: boolean;
    puedeRemover?: boolean;
    onModificar?: (o: unknown) => void;
  } = {},
) {
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
    <ObservacionesEvaluacionCuantitativaPanel
      evaluacion={EVALUACION}
      onCerrar={onCerrar}
      {...modificacion}
    />,
  );
  return { refetch, onCerrar, goToPage: (estado.goToPage as typeof goToPage) ?? goToPage };
}

function mockRemocion(mutate: ReturnType<typeof vi.fn>) {
  vi.mocked(useRemoverObservacionItemJurado).mockReturnValue({
    isPending: false,
    mutate,
  } as Partial<ReturnType<typeof useRemoverObservacionItemJurado>> as ReturnType<
    typeof useRemoverObservacionItemJurado
  >);
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

  it('con puedeModificar ofrece «Modificar observación» y entrega la observación elegida', async () => {
    // Arrange
    const onModificar = vi.fn();
    montar({ data: pagina(['Falta rigor']) }, { puedeModificar: true, onModificar });

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Modificar observación' })[0]);

    // Assert
    expect(onModificar).toHaveBeenCalledWith({ id: 'o-0', descripcion: 'Falta rigor' });
  });

  it('sin puedeModificar no ofrece «Modificar observación»', () => {
    // Arrange / Act
    montar({ data: pagina(['Falta rigor']) });

    // Assert
    expect(screen.queryByRole('button', { name: 'Modificar observación' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remover observación' })).not.toBeInTheDocument();
  });

  it('con puedeRemover y puedeModificar conviven los dos botones por fila', () => {
    // Arrange / Act
    montar(
      { data: pagina(['Falta rigor']) },
      { puedeModificar: true, puedeRemover: true, onModificar: vi.fn() },
    );

    // Assert
    expect(screen.getAllByRole('button', { name: 'Modificar observación' }).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByRole('button', { name: 'Remover observación' }).length).toBeGreaterThan(
      0,
    );
  });

  it('«Remover observación» abre la confirmación del ítem y cancelar no remueve', async () => {
    // Arrange
    const mutate = vi.fn();
    mockRemocion(mutate);
    montar({ data: pagina(['Falta rigor']) }, { puedeRemover: true });

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Remover observación' })[0]);

    // Assert
    expect(screen.getByRole('alertdialog')).toHaveTextContent('Claridad');

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al remover la única fila de una página posterior retrocede a la anterior', async () => {
    // Arrange
    mockRemocion(
      vi.fn((_id: string, opciones?: { onSuccess?: () => void }) => opciones?.onSuccess?.()),
    );
    const { goToPage } = montar(
      { data: { ...pagina(['Falta rigor']), number: 1, totalPages: 2 }, page: 1 },
      { puedeRemover: true },
    );

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Remover observación' })[0]);
    await userEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Remover observación' }),
    );

    // Assert
    expect(goToPage).toHaveBeenCalledWith(0);
  });
});
