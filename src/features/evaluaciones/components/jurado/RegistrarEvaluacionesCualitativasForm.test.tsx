import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { Route, Routes } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import RegistrarEvaluacionesCualitativasForm from './RegistrarEvaluacionesCualitativasForm';
import { useItemsCualitativosJurado } from '../../hooks/useItemsCualitativosJurado';
import { useCriteriosItemCualitativoJurado } from '../../hooks/useCriteriosItemCualitativoJurado';
import { useRegistrarEvaluacionesCualitativasJurado } from '../../hooks/useRegistrarEvaluacionesCualitativasJurado';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';

vi.mock('../../hooks/useItemsCualitativosJurado', () => ({ useItemsCualitativosJurado: vi.fn() }));
vi.mock('../../hooks/useCriteriosItemCualitativoJurado', () => ({
  useCriteriosItemCualitativoJurado: vi.fn(),
}));
vi.mock('../../hooks/useRegistrarEvaluacionesCualitativasJurado', () => ({
  useRegistrarEvaluacionesCualitativasJurado: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const ID_CLARIDAD = '11111111-1111-4111-8111-111111111111';
const ID_ORDEN = '22222222-2222-4222-8222-222222222222';
const ID_SUFICIENTE = '33333333-3333-4333-8333-333333333333';

const ASIGNACION: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  estado: { id: 'PENDIENTE_POR_EVALUAR', nombre: 'Pendiente por evaluar' },
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
};

const ITEMS = [
  { id: ID_CLARIDAD, nombre: 'Claridad', descripcion: 'Se entiende' },
  { id: ID_ORDEN, nombre: 'Orden', descripcion: 'Está ordenado' },
];
const CRITERIOS = [{ id: ID_SUFICIENTE, nombre: 'Suficiente', descripcion: 'Cumple' }];

type MutateOptions = { onSuccess?: () => void; onError?: (err: unknown) => void };
type Mutacion = ReturnType<typeof useRegistrarEvaluacionesCualitativasJurado>;
type Catalogo<T> = ReturnType<typeof useItemsCualitativosJurado> & { data: T };

function mockCatalogos(
  items: Partial<ReturnType<typeof useItemsCualitativosJurado>> = { data: ITEMS },
  criterios: Partial<ReturnType<typeof useCriteriosItemCualitativoJurado>> = { data: CRITERIOS },
) {
  const base = { isLoading: false, isError: false, error: null, refetch: vi.fn() };
  const refetchItems = vi.fn();
  const refetchCriterios = vi.fn();
  vi.mocked(useItemsCualitativosJurado).mockReturnValue({
    ...base,
    refetch: refetchItems,
    ...items,
  } as Catalogo<typeof ITEMS>);
  vi.mocked(useCriteriosItemCualitativoJurado).mockReturnValue({
    ...base,
    refetch: refetchCriterios,
    ...criterios,
  } as never);
  return { refetchItems, refetchCriterios };
}

function mockMutacion(parcial: Partial<Mutacion> = {}) {
  const mutate = vi.fn();
  vi.mocked(useRegistrarEvaluacionesCualitativasJurado).mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate,
    reset: vi.fn(),
    ...parcial,
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

function montar() {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:id/evaluar"
        element={<RegistrarEvaluacionesCualitativasForm asignacion={ASIGNACION} />}
      />
      <Route path="/evaluaciones" element={<p>Pantalla Mis evaluaciones</p>} />
    </Routes>,
    { initialPath: '/evaluaciones/ej-1/evaluar' },
  );
}

async function elegir(user: ReturnType<typeof userEvent.setup>, campo: string, opcion: string) {
  await user.click(screen.getByRole('combobox', { name: campo }));
  await user.click(await screen.findByRole('option', { name: new RegExp(opcion) }));
}

async function agregarPar(
  user: ReturnType<typeof userEvent.setup>,
  item: string,
  criterio = 'Suficiente',
) {
  await elegir(user, 'Ítem', item);
  await elegir(user, 'Criterio', criterio);
  await user.click(screen.getByRole('button', { name: 'Agregar a la lista' }));
}

function crearErrorApi(errorCode: string, message: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('RegistrarEvaluacionesCualitativasForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalogos();
    mockMutacion();
  });

  it('muestra el estado de carga mientras llegan los catálogos', () => {
    // Arrange
    mockCatalogos({ isLoading: true, data: undefined });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('muestra el error de un catálogo con "Reintentar" que consulta solo el que falló', async () => {
    // Arrange
    const user = userEvent.setup();
    const { refetchItems, refetchCriterios } = mockCatalogos(
      { data: ITEMS },
      { isError: true, error: new Error('fallo'), data: undefined },
    );
    montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetchCriterios).toHaveBeenCalledTimes(1);
    expect(refetchItems).not.toHaveBeenCalled();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con el catálogo de ítems vacío avisa y deja el envío deshabilitado', () => {
    // Arrange
    mockCatalogos({ data: [] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Aún no hay ítems cualitativos para evaluar.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar evaluación' })).toBeDisabled();
  });

  it('sin pares muestra la ayuda y deshabilita el envío y el botón de agregar', () => {
    // Act
    montar();

    // Assert
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar evaluación' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Agregar a la lista' })).toBeDisabled();
  });

  it('agregar un par lo lista, excluye ese ítem del selector y habilita el envío; quitarlo lo devuelve', async () => {
    // Arrange
    const user = userEvent.setup();
    montar();

    // Act
    await agregarPar(user, 'Claridad');

    // Assert
    const lista = screen.getByRole('list', { name: 'Valoraciones por registrar' });
    expect(within(lista).getByText('Claridad')).toBeInTheDocument();
    expect(within(lista).getByText('Criterio: Suficiente')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar evaluación' })).toBeEnabled();
    await user.click(screen.getByRole('combobox', { name: 'Ítem' }));
    expect(screen.queryByRole('option', { name: /Claridad/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Orden/ })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');
    await user.click(within(lista).getByRole('button'));

    // Assert
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Ítem' }));
    expect(screen.getByRole('option', { name: /Claridad/ })).toBeInTheDocument();
  });

  it('envía los pares, avisa con un toast y vuelve a Mis evaluaciones', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_pares: unknown, opciones: MutateOptions) => opciones.onSuccess?.());
    montar();
    await agregarPar(user, 'Claridad');
    await agregarPar(user, 'Orden');

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar evaluación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      [
        { itemId: ID_CLARIDAD, criterioId: ID_SUFICIENTE },
        { itemId: ID_ORDEN, criterioId: ID_SUFICIENTE },
      ],
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Evaluación registrada',
      expect.stringContaining('2 valoraciones'),
    );
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
  });

  it('ante un 422 ITEMS_YA_REGISTRADOS muestra el mensaje con nombres, no navega y conserva la lista', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    const error = crearErrorApi(
      'EVALUACION_CUALITATIVA_JURADO_ITEMS_YA_REGISTRADOS',
      `Items: [${ID_CLARIDAD}]`,
    );
    mutate.mockImplementation((_pares: unknown, opciones: MutateOptions) => {
      mockMutacion({ isError: true, error });
      opciones.onError?.(error);
    });
    const { rerender } = montar();
    await agregarPar(user, 'Claridad');

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar evaluación' }));
    rerender(
      <Routes>
        <Route
          path="/evaluaciones/:id/evaluar"
          element={<RegistrarEvaluacionesCualitativasForm asignacion={ASIGNACION} />}
        />
      </Routes>,
    );

    // Assert
    const mensaje =
      'Ya registraste una valoración para: Claridad. Quítalos de la lista e inténtalo de nuevo.';
    expect(toast.error).toHaveBeenCalledWith('No se pudo registrar la evaluación', mensaje);
    expect(await screen.findByText(mensaje)).toBeInTheDocument();
    expect(screen.queryByText('Pantalla Mis evaluaciones')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'Valoraciones por registrar' })).getByText(
        'Claridad',
      ),
    ).toBeInTheDocument();
  });

  it('cancelar con pares pide confirmación y sin pares vuelve directo', async () => {
    // Arrange
    const user = userEvent.setup();
    const primera = montar();
    await agregarPar(user, 'Claridad');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.getByText('¿Descartar la evaluación?')).toBeInTheDocument();
    expect(screen.queryByText('Pantalla Mis evaluaciones')).not.toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Descartar' }));

    // Assert
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();

    // Arrange
    primera.unmount();
    montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
  });
});
