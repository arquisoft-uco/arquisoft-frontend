import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { Route, Routes } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import RegistrarEvaluacionesCuantitativasForm from './RegistrarEvaluacionesCuantitativasForm';
import { useItemsCuantitativosJurado } from '../../hooks/useItemsCuantitativosJurado';
import { useCategoriasItemCuantitativoJurado } from '../../hooks/useCategoriasItemCuantitativoJurado';
import { useRegistrarEvaluacionesCuantitativasJurado } from '../../hooks/useRegistrarEvaluacionesCuantitativasJurado';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionAsignadaJurado } from '../../models/EvaluacionAsignadaJurado';

vi.mock('../../hooks/useItemsCuantitativosJurado', () => ({
  useItemsCuantitativosJurado: vi.fn(),
}));
vi.mock('../../hooks/useCategoriasItemCuantitativoJurado', () => ({
  useCategoriasItemCuantitativoJurado: vi.fn(),
}));
vi.mock('../../hooks/useRegistrarEvaluacionesCuantitativasJurado', () => ({
  useRegistrarEvaluacionesCuantitativasJurado: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const ID_ARQUITECTURA = '11111111-1111-4111-8111-111111111111';
const ID_PRUEBAS = '22222222-2222-4222-8222-222222222222';
const ID_CATEGORIA = '33333333-3333-4333-8333-333333333333';

const ASIGNACION: EvaluacionAsignadaJurado = {
  id: 'ej-1',
  estado: { id: 'PENDIENTE_POR_EVALUAR', nombre: 'Pendiente por evaluar' },
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  tieneEvaluacionesCualitativas: false,
  tieneEvaluacionesCuantitativas: false,
};

const ITEMS = [
  {
    id: ID_ARQUITECTURA,
    nombre: 'Arquitectura',
    descripcion: 'Diseño',
    categoriaId: ID_CATEGORIA,
    valor: 50,
  },
  {
    id: ID_PRUEBAS,
    nombre: 'Pruebas',
    descripcion: 'Cobertura',
    categoriaId: ID_CATEGORIA,
    valor: 30,
  },
];
const CATEGORIAS = [{ id: ID_CATEGORIA, nombre: 'Técnica', descripcion: 'Aspectos técnicos' }];

type MutateOptions = { onSuccess?: () => void; onError?: (err: unknown) => void };
type Mutacion = ReturnType<typeof useRegistrarEvaluacionesCuantitativasJurado>;

function mockCatalogos(
  items: Partial<ReturnType<typeof useItemsCuantitativosJurado>> = { data: ITEMS },
  categorias: Partial<ReturnType<typeof useCategoriasItemCuantitativoJurado>> = {
    data: CATEGORIAS,
  },
) {
  const base = { isLoading: false, isError: false, error: null };
  const refetchItems = vi.fn();
  const refetchCategorias = vi.fn();
  vi.mocked(useItemsCuantitativosJurado).mockReturnValue({
    ...base,
    refetch: refetchItems,
    ...items,
  } as never);
  vi.mocked(useCategoriasItemCuantitativoJurado).mockReturnValue({
    ...base,
    refetch: refetchCategorias,
    ...categorias,
  } as never);
  return { refetchItems, refetchCategorias };
}

function mockMutacion(parcial: Partial<Mutacion> = {}) {
  const mutate = vi.fn();
  vi.mocked(useRegistrarEvaluacionesCuantitativasJurado).mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate,
    reset: vi.fn(),
    ...parcial,
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

const RUTA = (
  <Routes>
    <Route
      path="/evaluaciones/:id/evaluar-cuantitativas"
      element={<RegistrarEvaluacionesCuantitativasForm asignacion={ASIGNACION} />}
    />
    <Route path="/evaluaciones" element={<p>Pantalla Mis evaluaciones</p>} />
  </Routes>
);

function montar() {
  return render(RUTA, { initialPath: '/evaluaciones/ej-1/evaluar-cuantitativas' });
}

async function elegirItem(user: ReturnType<typeof userEvent.setup>, item: string) {
  await user.click(screen.getByRole('combobox', { name: 'Ítem' }));
  await user.click(await screen.findByRole('option', { name: new RegExp(item) }));
}

async function agregarPar(user: ReturnType<typeof userEvent.setup>, item: string, puntaje: string) {
  await elegirItem(user, item);
  await user.type(screen.getByRole('textbox', { name: 'Puntaje' }), puntaje);
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

describe('RegistrarEvaluacionesCuantitativasForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCatalogos();
    mockMutacion();
  });

  it('muestra la carga, el error con reintento del catálogo que falló y el vacío sin ítems', async () => {
    // Arrange
    const user = userEvent.setup();
    mockCatalogos({ isLoading: true, data: undefined });
    const carga = montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

    // Arrange
    carga.unmount();
    const { refetchItems, refetchCategorias } = mockCatalogos(
      { data: ITEMS },
      { isError: true, error: new Error('fallo'), data: undefined },
    );
    const error = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(refetchCategorias).toHaveBeenCalledTimes(1);
    expect(refetchItems).not.toHaveBeenCalled();

    // Arrange
    error.unmount();
    mockCatalogos({ data: [] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Aún no hay ítems cuantitativos para valorar')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('agregar un par lo lista con su puntaje, excluye el ítem del selector y quitarlo lo devuelve', async () => {
    // Arrange
    const user = userEvent.setup();
    montar();
    expect(screen.getByRole('button', { name: 'Registrar evaluación' })).toBeDisabled();

    // Act
    await agregarPar(user, 'Arquitectura', '40');

    // Assert
    const lista = screen.getByRole('list', { name: 'Valoraciones por registrar' });
    expect(within(lista).getByText('Arquitectura')).toBeInTheDocument();
    expect(within(lista).getByText('Técnica · puntaje 40 de 50')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar evaluación' })).toBeEnabled();
    await user.click(screen.getByRole('combobox', { name: 'Ítem' }));
    expect(screen.queryByRole('option', { name: /Arquitectura/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Pruebas/ })).toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');
    await user.click(within(lista).getByRole('button'));

    // Assert
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Ítem' }));
    expect(screen.getByRole('option', { name: /Arquitectura/ })).toBeInTheDocument();
  });

  it('un puntaje mayor al máximo del ítem o no entero muestra el error en el campo y no agrega', async () => {
    // Arrange
    const user = userEvent.setup();
    montar();
    await elegirItem(user, 'Pruebas');
    const campo = screen.getByRole('textbox', { name: 'Puntaje' });

    // Act
    await user.type(campo, '31');
    await user.click(screen.getByRole('button', { name: 'Agregar a la lista' }));

    // Assert
    expect(await screen.findByText('Debe estar entre 0 y 30')).toBeInTheDocument();
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();

    // Act
    await user.clear(campo);
    await user.type(campo, '1.5');
    await user.click(screen.getByRole('button', { name: 'Agregar a la lista' }));

    // Assert
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();
    expect(campo).toHaveAttribute('aria-invalid', 'true');
  });

  it('envía los pares con puntaje numérico, avisa con un toast y vuelve a Mis evaluaciones', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_pares: unknown, opciones: MutateOptions) => opciones.onSuccess?.());
    montar();
    await agregarPar(user, 'Arquitectura', '40');
    await agregarPar(user, 'Pruebas', '0');

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar evaluación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      [
        { itemId: ID_ARQUITECTURA, puntaje: 40 },
        { itemId: ID_PRUEBAS, puntaje: 0 },
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
      'EVALUACION_CUANTITATIVA_JURADO_ITEMS_YA_REGISTRADOS',
      `Items: [${ID_ARQUITECTURA}]`,
    );
    mutate.mockImplementation((_pares: unknown, opciones: MutateOptions) => {
      mockMutacion({ isError: true, error });
      opciones.onError?.(error);
    });
    const { rerender } = montar();
    await agregarPar(user, 'Arquitectura', '40');

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar evaluación' }));
    rerender(RUTA);

    // Assert
    const mensaje =
      'Ya registraste un puntaje para: Arquitectura. Quítalos de la lista e inténtalo de nuevo.';
    expect(toast.error).toHaveBeenCalledWith('No se pudo registrar la evaluación', mensaje);
    expect(await screen.findByText(mensaje)).toBeInTheDocument();
    expect(screen.queryByText('Pantalla Mis evaluaciones')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'Valoraciones por registrar' })).getByText(
        'Arquitectura',
      ),
    ).toBeInTheDocument();
  });

  it('cancelar con pares pide confirmación y sin pares vuelve directo', async () => {
    // Arrange
    const user = userEvent.setup();
    const primera = montar();
    await agregarPar(user, 'Arquitectura', '40');

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
