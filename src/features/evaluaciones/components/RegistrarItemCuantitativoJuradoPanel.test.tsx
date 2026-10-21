import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../test-utils/render';
import RegistrarItemCuantitativoJuradoPanel from './RegistrarItemCuantitativoJuradoPanel';
import { useRegistrarItemCuantitativoJurado } from '../hooks/useRegistrarItemCuantitativoJurado';
import { useCategoriasItemCuantitativoJurado } from '../hooks/useCategoriasItemCuantitativoJurado';
import { toast } from '../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../shared/validation';
import type { ApiError } from '../../../shared/models/api-response';
import type { CategoriaItemCuantitativoJurado } from '../models/CategoriaItemCuantitativoJurado';

vi.mock('../hooks/useRegistrarItemCuantitativoJurado', () => ({
  useRegistrarItemCuantitativoJurado: vi.fn(),
}));
vi.mock('../hooks/useCategoriasItemCuantitativoJurado', () => ({
  useCategoriasItemCuantitativoJurado: vi.fn(),
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useRegistrarMock = vi.mocked(useRegistrarItemCuantitativoJurado);
const useCategoriasMock = vi.mocked(useCategoriasItemCuantitativoJurado);

const CATEGORIAS: CategoriaItemCuantitativoJurado[] = [
  { id: 'c-1', nombre: 'Técnica', descripcion: 'Aspectos técnicos.' },
  { id: 'c-2', nombre: 'Social', descripcion: 'Aspectos sociales.' },
];

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type MutateOptions = {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
};

type Mutacion = ReturnType<typeof useRegistrarItemCuantitativoJurado>;
type Categorias = ReturnType<typeof useCategoriasItemCuantitativoJurado>;

function mockMutacion(mutate = vi.fn(), isPending = false) {
  useRegistrarMock.mockReturnValue({
    data: undefined,
    error: null,
    status: isPending ? 'pending' : 'idle',
    isError: false,
    isIdle: !isPending,
    isPending,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as Partial<Mutacion> as Mutacion);
  return mutate;
}

function mockCategorias(parcial: Partial<Categorias> = { data: CATEGORIAS, isSuccess: true }) {
  useCategoriasMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    isSuccess: false,
    refetch: vi.fn(),
    ...parcial,
  } as Partial<Categorias> as Categorias);
}

async function llenarValido(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre'), 'Rigor');
  await user.type(screen.getByLabelText('Descripción'), 'Calidad del método.');
  await user.selectOptions(screen.getByLabelText('Categoría'), 'c-1');
  await user.type(screen.getByLabelText(/Valor máximo/), '30');
}

const enviar = () => screen.getByRole('button', { name: 'Registrar ítem' });

describe('RegistrarItemCuantitativoJuradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategorias();
  });

  it('al enviar vacío muestra los errores de cada campo, no llama mutate y limita la longitud con LIMITES', async () => {
    // Arrange
    const mutate = mockMutacion();
    const user = userEvent.setup();
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={vi.fn()} />);

    // Act
    await user.click(enviar());

    // Assert
    expect(await screen.findAllByText(MENSAJES_VALIDACION.requerido)).not.toHaveLength(0);
    expect(screen.getAllByText(MENSAJES_VALIDACION.seleccioneOpcion).length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
    expect(enviar()).toBeEnabled();
    expect(screen.getByLabelText('Nombre')).toHaveAttribute(
      'maxlength',
      String(LIMITES.ITEM_CUANTITATIVO_NOMBRE_MAX),
    );
    expect(screen.getByLabelText('Descripción')).toHaveAttribute(
      'maxlength',
      String(LIMITES.ITEM_CUANTITATIVO_DESCRIPCION_MAX),
    );
  });

  it('rechaza un valor fuera de rango y uno no entero sin llamar mutate', async () => {
    // Arrange
    const mutate = mockMutacion();
    const user = userEvent.setup();
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={vi.fn()} />);
    await llenarValido(user);
    const valor = screen.getByLabelText(/Valor máximo/);

    // Act
    await user.clear(valor);
    await user.type(valor, String(LIMITES.ITEM_CUANTITATIVO_VALOR_MAX + 1));
    await user.click(enviar());

    // Assert
    expect(
      await screen.findAllByText(
        MENSAJES_VALIDACION.valorEntre(
          LIMITES.ITEM_CUANTITATIVO_VALOR_MIN,
          LIMITES.ITEM_CUANTITATIVO_VALOR_MAX,
        ),
      ),
    ).not.toHaveLength(0);

    // Act
    await user.clear(valor);
    await user.type(valor, '1.5');
    await user.click(enviar());

    // Assert
    expect(await screen.findAllByText(MENSAJES_VALIDACION.soloDigitos)).not.toHaveLength(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('envía con datos válidos y valor numérico, notifica el éxito y cierra el panel', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) => opciones?.onSuccess?.());
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={onCerrar} />);

    // Act
    await llenarValido(user);
    await user.click(enviar());

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { nombre: 'Rigor', descripcion: 'Calidad del método.', categoriaId: 'c-1', valor: 30 },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Ítem registrado', expect.stringContaining('Rigor'));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('pinta el 422 de nombre duplicado en el campo nombre, lanza toast y no cierra', async () => {
    // Arrange
    const mensaje = 'Ya existe un ítem con ese nombre en la categoría.';
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'ITEM_CUANTITATIVO_JURADO_NOMBRE_CATEGORIA_DUPLICADO',
          message: mensaje,
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={onCerrar} />);

    // Act
    await llenarValido(user);
    await user.click(enviar());

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText('Nombre')).toHaveAccessibleDescription(
      expect.stringContaining(mensaje),
    );
    expect(screen.getByLabelText('Nombre')).toHaveValue('Rigor');
    expect(toast.error).toHaveBeenCalledWith('No se pudo registrar el ítem', mensaje);
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('pinta el 422 de categoría no encontrada en el campo categoría', async () => {
    // Arrange
    const mensaje = 'La categoría no existe.';
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Unprocessable Entity',
          errorCode: 'ITEM_CUANTITATIVO_JURADO_CATEGORIA_NO_ENCONTRADA',
          message: mensaje,
          status: 422,
        }),
      ),
    );
    mockMutacion(mutate);
    const user = userEvent.setup();
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={vi.fn()} />);

    // Act
    await llenarValido(user);
    await user.click(enviar());

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText('Categoría')).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText('Categoría')).toHaveAccessibleDescription(
      expect.stringContaining(mensaje),
    );
    expect(toast.error).toHaveBeenCalledWith('No se pudo registrar el ítem', mensaje);
  });

  it('pinta los fieldErrors 400 de valor y categoría en sus campos', async () => {
    // Arrange
    const mutate = vi.fn((_req: unknown, opciones?: MutateOptions) =>
      opciones?.onError?.(
        crearErrorApi({
          error: 'Bad Request',
          message: 'Datos inválidos',
          status: 400,
          fieldErrors: [
            { field: 'valor', message: 'Valor fuera de rango' },
            { field: 'categoria', message: 'Categoría requerida' },
          ],
        }),
      ),
    );
    mockMutacion(mutate);
    const user = userEvent.setup();
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={vi.fn()} />);

    // Act
    await llenarValido(user);
    await user.click(enviar());

    // Assert
    await waitFor(() =>
      expect(screen.getByLabelText(/Valor máximo/)).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(screen.getByLabelText(/Valor máximo/)).toHaveAccessibleDescription(
      expect.stringContaining('Valor fuera de rango'),
    );
    expect(screen.getByLabelText('Categoría')).toHaveAccessibleDescription(
      expect.stringContaining('Categoría requerida'),
    );
    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'false');
    expect(toast.error).toHaveBeenCalledWith('No se pudo registrar el ítem', 'Datos inválidos');
  });

  it('con el catálogo en error ofrece Reintentar, que vuelve a consultar', async () => {
    // Arrange
    const refetch = vi.fn();
    mockMutacion();
    mockCategorias({ data: undefined, isError: true, refetch });
    const user = userEvent.setup();

    // Act
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No se pudieron cargar las categorías')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('con el catálogo vacío avisa que se necesita al menos una categoría', () => {
    // Arrange
    mockMutacion();
    mockCategorias({ data: [], isSuccess: true });

    // Act
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText(/Aún no hay categorías registradas/)).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'No hay categorías disponibles' }),
    ).toBeInTheDocument();
  });

  it('durante el envío deshabilita el botón y marca el formulario como ocupado', () => {
    // Arrange
    mockMutacion(vi.fn(), true);

    // Act
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Registrando…' })).toBeDisabled();
    expect(screen.getByRole('form', { name: 'Registro de ítem cuantitativo' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('al cancelar cierra el panel sin enviar', async () => {
    // Arrange
    const mutate = mockMutacion();
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<RegistrarItemCuantitativoJuradoPanel onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
    expect(mutate).not.toHaveBeenCalled();
  });
});
