import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import CambiarCriterioEvaluacionCualitativaAsesorPanel from './CambiarCriterioEvaluacionCualitativaAsesorPanel';
import { useCriteriosItemCualitativoAsesor } from '../../hooks/useCriteriosItemCualitativoAsesor';
import { useCambiarCriterioEvaluacionCualitativaAsesor } from '../../hooks/useCambiarCriterioEvaluacionCualitativaAsesor';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionCualitativaAsesor } from '../../models/EvaluacionCualitativaAsesor';

vi.mock('../../hooks/useCriteriosItemCualitativoAsesor', () => ({
  useCriteriosItemCualitativoAsesor: vi.fn(),
}));
vi.mock('../../hooks/useCambiarCriterioEvaluacionCualitativaAsesor', () => ({
  useCambiarCriterioEvaluacionCualitativaAsesor: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

vi.setConfig({ testTimeout: 15000 });

const ID_EXCELENTE = '11111111-1111-4111-8111-111111111111';
const ID_SUFICIENTE = '22222222-2222-4222-8222-222222222222';

const FILA: EvaluacionCualitativaAsesor = {
  id: 'ec-1',
  item: { id: 'i-1', nombre: 'Claridad', descripcion: 'Se entiende', peso: 100 },
  criterio: { id: ID_EXCELENTE, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
};
const CRITERIOS = [
  { id: ID_EXCELENTE, nombre: 'Excelente', descripcion: 'Supera lo esperado' },
  { id: ID_SUFICIENTE, nombre: 'Suficiente', descripcion: 'Cumple' },
];

type MutateOptions = { onSuccess?: () => void; onError?: (err: unknown) => void };

function mockCatalogo(parcial: Record<string, unknown> = { data: CRITERIOS }) {
  const refetch = vi.fn();
  vi.mocked(useCriteriosItemCualitativoAsesor).mockReturnValue({
    isLoading: false,
    isError: false,
    refetch,
    ...parcial,
  } as never);
  return refetch;
}

function mockMutacion() {
  const mutate = vi.fn();
  vi.mocked(useCambiarCriterioEvaluacionCualitativaAsesor).mockReturnValue({
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

describe('CambiarCriterioEvaluacionCualitativaAsesorPanel', () => {
  const onCerrar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalogo();
  });

  function montar() {
    return render(
      <CambiarCriterioEvaluacionCualitativaAsesorPanel
        fila={FILA}
        evaluacionAsesorId="ea-1"
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
      { evaluacionCualitativaAsesorId: 'ec-1', criterioId: ID_SUFICIENTE },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Criterio cambiado', expect.any(String));
    expect(onCerrar).toHaveBeenCalled();
  });

  it.each([
    'EVALUACION_CUALITATIVA_ASESOR_EVALUACION_CUALITATIVA_NO_ENCONTRADA',
    'EVALUACION_CUALITATIVA_ASESOR_CAMBIO_CRITERIO_EVALUACION_ASESOR_FINALIZADA',
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

  it('con otro 422 avisa con el mensaje del backend y el panel sigue abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_req: unknown, opciones: MutateOptions) =>
      opciones.onError?.(errorApi('EVALUACION_CUALITATIVA_ASESOR_NO_PERTENECE_ASESOR', 'De otro')),
    );
    montar();

    // Act
    await elegirSuficienteYGuardar(user);

    // Assert
    expect(toast.error).toHaveBeenCalledWith('No se pudo cambiar el criterio', 'De otro');
    expect(onCerrar).not.toHaveBeenCalled();
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
