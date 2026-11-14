import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import ObservacionesItemJuradoPanel from './ObservacionesItemJuradoPanel';
import { useObservacionesItemJurado } from '../../hooks/useObservacionesItemJurado';
import type { EvaluacionCuantitativaJurado } from '../../models/EvaluacionCuantitativaJurado';
import type { ObservacionItemJurado } from '../../models/ObservacionItemJurado';

vi.mock('../../hooks/useObservacionesItemJurado', () => ({
  useObservacionesItemJurado: vi.fn(),
}));

const useObservacionesMock = vi.mocked(useObservacionesItemJurado);

const VALORACION: EvaluacionCuantitativaJurado = {
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

const OBS_A: ObservacionItemJurado = { id: 'obs-1', descripcion: 'Falta profundidad' };
const OBS_B: ObservacionItemJurado = { id: 'obs-2', descripcion: 'Buen enfoque' };

type Consulta = ReturnType<typeof useObservacionesItemJurado>;

function mockConsulta(parcial: Record<string, unknown>) {
  const refetch = vi.fn();
  useObservacionesMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch,
    ...parcial,
  } as Partial<Consulta> as Consulta);
  return refetch;
}

function crearError(status: number) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, message: 'Falla del servidor' },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function montar(puedeModificar = true) {
  const onModificar = vi.fn();
  const onCerrar = vi.fn();
  render(
    <ObservacionesItemJuradoPanel
      valoracion={VALORACION}
      puedeModificar={puedeModificar}
      onModificar={onModificar}
      onCerrar={onCerrar}
    />,
  );
  return { onModificar, onCerrar };
}

describe('ObservacionesItemJuradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con lista vacía muestra el vacío sin tratarlo como error', () => {
    // Arrange
    mockConsulta({ data: { content: [] } });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Este ítem no tiene observaciones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ante un error muestra el mensaje y reintenta con refetch', async () => {
    // Arrange
    const refetch = mockConsulta({ isError: true, error: crearError(500) });
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Falla del servidor');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('el 422 indica que el ítem ya no está disponible, sin reintento', () => {
    // Arrange
    mockConsulta({ isError: true, error: crearError(422) });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Este ítem ya no está disponible');
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('lista cada observación y «Modificar observación» entrega la elegida', async () => {
    // Arrange
    mockConsulta({ data: { content: [OBS_A, OBS_B] } });
    const { onModificar } = montar();

    // Act
    await userEvent.click(
      screen.getByRole('button', { name: `Modificar observación: ${OBS_B.descripcion}` }),
    );

    // Assert
    expect(screen.getByText(OBS_A.descripcion)).toBeInTheDocument();
    expect(screen.getByText(OBS_B.descripcion)).toBeInTheDocument();
    expect(onModificar).toHaveBeenCalledWith(OBS_B);
  });

  it('con la evaluación finalizada no ofrece modificar y muestra el aviso', () => {
    // Arrange
    mockConsulta({ data: { content: [OBS_A] } });

    // Act
    montar(false);

    // Assert
    expect(screen.getByText(OBS_A.descripcion)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Modificar observación/ })).not.toBeInTheDocument();
    expect(screen.getByText(/La evaluación está finalizada/)).toBeInTheDocument();
  });
});
