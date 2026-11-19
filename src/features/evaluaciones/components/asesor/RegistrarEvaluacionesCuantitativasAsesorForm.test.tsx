import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { Route, Routes, useLocation } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import RegistrarEvaluacionesCuantitativasAsesorForm from './RegistrarEvaluacionesCuantitativasAsesorForm';
import { useItemsCuantitativosAsesor } from '../../hooks/useItemsCuantitativosAsesor';
import { useCategoriasItemCuantitativoAsesor } from '../../hooks/useCategoriasItemCuantitativoAsesor';
import { useRegistrarEvaluacionesCuantitativasAsesor } from '../../hooks/useRegistrarEvaluacionesCuantitativasAsesor';
import { toast } from '../../../../shared/hooks/useToast';
import type { EvaluacionAsignadaAsesor } from '../../models/EvaluacionAsignadaAsesor';

vi.mock('../../hooks/useItemsCuantitativosAsesor', () => ({
  useItemsCuantitativosAsesor: vi.fn(),
}));
vi.mock('../../hooks/useCategoriasItemCuantitativoAsesor', () => ({
  useCategoriasItemCuantitativoAsesor: vi.fn(),
}));
vi.mock('../../hooks/useRegistrarEvaluacionesCuantitativasAsesor', () => ({
  useRegistrarEvaluacionesCuantitativasAsesor: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const ID_CLARIDAD = '11111111-1111-4111-8111-111111111111';
const ID_ORDEN = '22222222-2222-4222-8222-222222222222';
const ID_CATEGORIA = '33333333-3333-4333-8333-333333333333';

const RUTA_LISTADO = '/evaluaciones?q=sis';

const ASIGNACION: EvaluacionAsignadaAsesor = {
  id: 'ea-1',
  evaluacion: { id: 'e-1', estado: { id: 'PENDIENTE', nombre: 'Pendiente' } },
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  tieneEvaluacionesCualitativas: false,
  tieneEvaluacionesCuantitativas: false,
};

const ITEMS = [
  {
    id: ID_CLARIDAD,
    nombre: 'Claridad',
    descripcion: 'Se entiende',
    categoriaId: ID_CATEGORIA,
    valor: 10,
  },
  {
    id: ID_ORDEN,
    nombre: 'Orden',
    descripcion: 'Está ordenado',
    categoriaId: ID_CATEGORIA,
    valor: 20,
  },
];
const CATEGORIAS = [{ id: ID_CATEGORIA, nombre: 'Forma', descripcion: 'Presentación' }];

type MutateOptions = { onSuccess?: () => void; onError?: (err: unknown) => void };
type Mutacion = ReturnType<typeof useRegistrarEvaluacionesCuantitativasAsesor>;

function mockCatalogos(
  items: Record<string, unknown> = { data: ITEMS },
  categorias: Record<string, unknown> = { data: CATEGORIAS },
) {
  const base = { isLoading: false, isError: false, error: null };
  const refetchItems = vi.fn();
  const refetchCategorias = vi.fn();
  vi.mocked(useItemsCuantitativosAsesor).mockReturnValue({
    ...base,
    refetch: refetchItems,
    ...items,
  } as never);
  vi.mocked(useCategoriasItemCuantitativoAsesor).mockReturnValue({
    ...base,
    refetch: refetchCategorias,
    ...categorias,
  } as never);
  return { refetchItems, refetchCategorias };
}

function mockMutacion(parcial: Partial<Mutacion> = {}) {
  const mutate = vi.fn();
  vi.mocked(useRegistrarEvaluacionesCuantitativasAsesor).mockReturnValue({
    error: null,
    isError: false,
    isPending: false,
    mutate,
    reset: vi.fn(),
    ...parcial,
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

function PantallaListado() {
  const { search } = useLocation();
  return (
    <>
      <p>Pantalla Mis evaluaciones</p>
      <p>{search}</p>
    </>
  );
}

const RUTA_FORM = '/evaluaciones/:id/evaluar-cuantitativas-asesor';

function formulario() {
  return (
    <Routes>
      <Route
        path={RUTA_FORM}
        element={
          <RegistrarEvaluacionesCuantitativasAsesorForm
            asignacion={ASIGNACION}
            rutaListado={RUTA_LISTADO}
          />
        }
      />
      <Route path="/evaluaciones" element={<PantallaListado />} />
    </Routes>
  );
}

function montar() {
  return render(formulario(), { initialPath: '/evaluaciones/ea-1/evaluar-cuantitativas-asesor' });
}

async function agregarPar(user: ReturnType<typeof userEvent.setup>, item: string, puntaje: string) {
  await user.click(screen.getByRole('combobox', { name: 'Ítem' }));
  await user.click(await screen.findByRole('option', { name: new RegExp(item) }));
  await user.type(screen.getByRole('textbox', { name: /Puntaje/ }), puntaje);
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

describe('RegistrarEvaluacionesCuantitativasAsesorForm', () => {
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
    const { refetchItems, refetchCategorias } = mockCatalogos(
      { data: ITEMS },
      { isError: true, error: new Error('fallo'), data: undefined },
    );
    montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetchCategorias).toHaveBeenCalledTimes(1);
    expect(refetchItems).not.toHaveBeenCalled();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('con el catálogo de ítems vacío muestra el vacío y no el formulario', () => {
    // Arrange
    mockCatalogos({ data: [] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Aún no hay ítems cuantitativos para valorar')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('sin pares deshabilita el envío, y agregar y quitar un par actualiza la lista y las opciones', async () => {
    // Arrange
    const user = userEvent.setup();
    montar();

    // Assert
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar evaluación' })).toBeDisabled();
    expect(screen.queryByRole('textbox', { name: /Observaci/ })).not.toBeInTheDocument();

    // Act
    await agregarPar(user, 'Claridad', '8');

    // Assert
    const lista = screen.getByRole('list', { name: 'Valoraciones por registrar' });
    expect(within(lista).getByText('Claridad')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar evaluación' })).toBeEnabled();
    await user.click(screen.getByRole('combobox', { name: 'Ítem' }));
    expect(screen.queryByRole('option', { name: /Claridad/ })).not.toBeInTheDocument();

    // Act
    await user.keyboard('{Escape}');
    await user.click(within(lista).getByRole('button'));

    // Assert
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();
  });

  it('un puntaje mayor que el máximo del ítem o no entero muestra el error y no agrega', async () => {
    // Arrange
    const user = userEvent.setup();
    montar();

    // Act
    await agregarPar(user, 'Claridad', '11');

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();

    // Act
    await user.clear(screen.getByRole('textbox', { name: /Puntaje/ }));
    await user.type(screen.getByRole('textbox', { name: /Puntaje/ }), '1a');
    await user.click(screen.getByRole('button', { name: 'Agregar a la lista' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Aún no has agregado valoraciones.')).toBeInTheDocument();
  });

  it('envía los pares, avisa con un toast y vuelve a Mis evaluaciones con la misma búsqueda', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    mutate.mockImplementation((_pares: unknown, opciones: MutateOptions) => opciones.onSuccess?.());
    montar();
    await agregarPar(user, 'Claridad', '8');
    await agregarPar(user, 'Orden', '20');

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar evaluación' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      [
        { itemId: ID_CLARIDAD, puntaje: 8 },
        { itemId: ID_ORDEN, puntaje: 20 },
      ],
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Evaluación registrada',
      expect.stringContaining('2 valoraciones'),
    );
    expect(await screen.findByText('Pantalla Mis evaluaciones')).toBeInTheDocument();
    expect(screen.getByText('?q=sis')).toBeInTheDocument();
  });

  it('ante un 422 ITEMS_YA_REGISTRADOS muestra el mensaje con nombres, no navega y conserva la lista', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    const error = crearErrorApi(
      'EVALUACION_CUANTITATIVA_ASESOR_ITEMS_YA_REGISTRADOS',
      `Items: [${ID_CLARIDAD}]`,
    );
    mutate.mockImplementation((_pares: unknown, opciones: MutateOptions) => {
      mockMutacion({ isError: true, error });
      opciones.onError?.(error);
    });
    const { rerender } = montar();
    await agregarPar(user, 'Claridad', '8');

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar evaluación' }));
    rerender(formulario());

    // Assert
    const mensaje =
      'Ya registraste un puntaje para: Claridad. Quítalos de la lista e inténtalo de nuevo.';
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
    await agregarPar(user, 'Claridad', '8');

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
