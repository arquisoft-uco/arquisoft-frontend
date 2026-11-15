import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import CambiarCriterioEvaluacionCualitativaJuradoPanel from './CambiarCriterioEvaluacionCualitativaJuradoPanel';
import { useCriteriosItemCualitativoJurado } from '../../hooks/useCriteriosItemCualitativoJurado';
import { useCambiarCriterioEvaluacionCualitativaJurado } from '../../hooks/useCambiarCriterioEvaluacionCualitativaJurado';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionCualitativaJurado } from '../../models/EvaluacionCualitativaJurado';

vi.mock('../../hooks/useCriteriosItemCualitativoJurado', () => ({
  useCriteriosItemCualitativoJurado: vi.fn(),
}));
vi.mock('../../hooks/useCambiarCriterioEvaluacionCualitativaJurado', () => ({
  useCambiarCriterioEvaluacionCualitativaJurado: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const ID_EXCELENTE = '11111111-1111-4111-8111-111111111111';
const ID_SUFICIENTE = '22222222-2222-4222-8222-222222222222';

const FILA: EvaluacionCualitativaJurado = {
  id: 'ec-1',
  item: { id: 'i-1', nombre: 'Claridad', descripcion: 'Se entiende' },
  criterio: { id: ID_EXCELENTE, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
};
const CRITERIOS = [
  { id: ID_EXCELENTE, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
  { id: ID_SUFICIENTE, nombre: 'Suficiente', descripcion: 'Cumple' },
];

type MutateOptions = { onSuccess?: () => void; onError?: (err: unknown) => void };

function mockCatalogo(parcial: Record<string, unknown> = { data: CRITERIOS }) {
  const refetch = vi.fn();
  vi.mocked(useCriteriosItemCualitativoJurado).mockReturnValue({
    isLoading: false,
    isError: false,
    refetch,
    ...parcial,
  } as never);
  return refetch;
}

function mockMutacion() {
  const mutate = vi.fn();
  vi.mocked(useCambiarCriterioEvaluacionCualitativaJurado).mockReturnValue({
    isPending: false,
    mutate,
    reset: vi.fn(),
  } as never);
  return mutate;
}

function errorApi(errorCode: string, message = 'Mensaje del backend', fieldErrors?: unknown) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422, fieldErrors },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function elegirSuficiente(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Criterio' }));
  await user.click(screen.getByRole('combobox', { name: 'Criterio' }));
  await user.click(await screen.findByRole('option', { name: /Suficiente/ }));
}

async function elegirSuficienteYGuardar(user: ReturnType<typeof userEvent.setup>) {
  await elegirSuficiente(user);
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
}

describe('CambiarCriterioEvaluacionCualitativaJuradoPanel', () => {
  const onCerrar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalogo();
  });

  function montar() {
    return render(
      <CambiarCriterioEvaluacionCualitativaJuradoPanel
        fila={FILA}
        evaluacionJuradoId="ej-1"
        onCerrar={onCerrar}
      />,
    );
  }

  it('muestra el criterio actual y deja «Guardar cambios» deshabilitado hasta elegir otro', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion();
    montar();

    // Assert
    expect(screen.getByText('Criterio actual: Excelente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();

    // Act
    await elegirSuficiente(user);

    // Assert
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeEnabled();
  });

  it('envía la evaluación y el criterio elegido; en éxito avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) => opciones.onSuccess?.());
    montar();

    // Act
    await elegirSuficienteYGuardar(user);

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { evaluacionCualitativaJuradoId: 'ec-1', criterioId: ID_SUFICIENTE },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Criterio cambiado', expect.any(String));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('con el 422 de criterio sin cambio avisa con su mensaje y el panel sigue abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(errorApi('EVALUACION_CUALITATIVA_JURADO_CRITERIO_SIN_CAMBIO')),
    );
    montar();

    // Act
    await elegirSuficienteYGuardar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo cambiar el criterio',
      'El criterio elegido ya es el actual.',
    );
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it.each([
    'EVALUACION_CUALITATIVA_JURADO_NO_ENCONTRADA',
    'EVALUACION_CUALITATIVA_JURADO_CAMBIO_CRITERIO_EVALUACION_JURADO_FINALIZADA',
  ])('con el 422 %s avisa y cierra el panel', async (codigo) => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(errorApi(codigo)),
    );
    montar();

    // Act
    await elegirSuficienteYGuardar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar el criterio', expect.any(String));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('pinta bajo el campo el error de backend sobre «criterio» y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(
        errorApi('VALIDACION', 'Inválido', [{ field: 'criterio', message: 'Criterio inválido' }]),
      ),
    );
    montar();

    // Act
    await elegirSuficienteYGuardar(user);

    // Assert
    expect(toast.error).toHaveBeenCalled();
    expect((await screen.findAllByText('Criterio inválido')).length).toBeGreaterThan(0);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con el catálogo cargando muestra el estado de carga y sin formulario', () => {
    // Arrange
    mockMutacion();
    mockCatalogo({ isLoading: true, data: undefined });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con error de catálogo muestra el error y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion();
    const refetch = mockCatalogo({ isError: true, data: undefined });

    // Act
    montar();
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});
