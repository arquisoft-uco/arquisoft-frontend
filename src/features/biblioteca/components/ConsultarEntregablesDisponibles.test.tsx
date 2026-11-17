import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import { toast } from '../../../shared/hooks/useToast';
import { LIMITES } from '../../../shared/validation';
import { errorApi } from '../../../test-utils/errores-api';
import type { EntregableDisponible } from '../models/EntregableDisponible';
import { useEntregablesDisponibles } from '../hooks/useEntregablesDisponibles';
import { useRegistrarDocumentacion } from '../hooks/useRegistrarDocumentacion';
import ConsultarEntregablesDisponibles from './ConsultarEntregablesDisponibles';

vi.mock('../hooks/useEntregablesDisponibles', () => ({
  useEntregablesDisponibles: vi.fn(),
}));

vi.mock('../hooks/useRegistrarDocumentacion', () => ({
  useRegistrarDocumentacion: vi.fn(),
}));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const ENTREGABLE: EntregableDisponible = {
  id: 'e-1',
  proyectoGrado: 'p-1',
  tituloProyecto: 'Sistema de riego',
  versionEntregable: 2,
  nombreArchivo: 'informe-final.pdf',
  autores: [
    { id: 'a-1', identificador: 'ana', nombre: 'Ana Pérez' },
    { id: 'a-2', identificador: 'luis', nombre: 'Luis Gómez' },
  ],
};

function crearPagina(content: EntregableDisponible[]) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  } as Page<EntregableDisponible>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEntregablesDisponibles>> = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    texto: '',
    setTexto: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEntregablesDisponibles>;
  vi.mocked(useEntregablesDisponibles).mockReturnValue(hook);
  return hook;
}

function mockRegistrar(
  mutate: (id: string, opciones: OpcionesMutate) => void = vi.fn(),
  isPending = false,
) {
  vi.mocked(useRegistrarDocumentacion).mockReturnValue({
    mutate,
    isPending,
  } as Partial<ReturnType<typeof useRegistrarDocumentacion>> as ReturnType<
    typeof useRegistrarDocumentacion
  >);
  return mutate;
}

async function abrirDialogo(user: ReturnType<typeof userEvent.setup>) {
  const [menu] = screen.getAllByRole('button', { name: 'Acciones del entregable, versión 2' });
  await user.click(menu);
  await user.click(screen.getByRole('menuitem', { name: 'Registrar documentación' }));
}

describe('ConsultarEntregablesDisponibles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEntregablesDisponibles).mockReset();
    mockRegistrar();
  });

  it('muestra cada fila con sus respaldos, el total y limita la búsqueda al máximo del título', () => {
    // Arrange
    mockHook({
      data: crearPagina([
        ENTREGABLE,
        { ...ENTREGABLE, id: 'e-2', tituloProyecto: null, autores: [] },
      ]),
    });

    // Act
    render(<ConsultarEntregablesDisponibles />);

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Entregables por registrar' }));
    expect(tabla.getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla.getByText('Sistema de riego')).toBeInTheDocument();
    expect(tabla.getAllByText('informe-final.pdf')).toHaveLength(2);
    expect(tabla.getByText('Ana Pérez y Luis Gómez')).toBeInTheDocument();
    expect(tabla.getByText('Sin título')).toBeInTheDocument();
    expect(tabla.getByText('Sin autores registrados')).toBeInTheDocument();
    expect(screen.getByText('2 entregables')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar entregables' })).toHaveAttribute(
      'maxlength',
      String(LIMITES.TITULO_PROYECTO_MAX),
    );
  });

  it('sin filas ni búsqueda muestra el vacío sin acción de limpiar', () => {
    // Arrange
    mockHook({ data: crearPagina([]) });

    // Act
    render(<ConsultarEntregablesDisponibles />);

    // Assert
    expect(screen.getByText('No hay entregables por registrar')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('sin filas con búsqueda muestra «Sin resultados» y «Limpiar filtros» llama a limpiarFiltros', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([]), texto: 'zzz' });

    // Act
    render(<ConsultarEntregablesDisponibles />);
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(hook.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('con error muestra el aviso, oculta la tabla y «Reintentar» llama a refetch', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });

    // Act
    render(<ConsultarEntregablesDisponibles />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar los entregables por registrar',
    );
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('«Registrar documentación» abre el diálogo con el proyecto y la versión, y «Cancelar» lo cierra sin registrar', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([ENTREGABLE]) });
    const mutate = mockRegistrar();
    render(<ConsultarEntregablesDisponibles />);

    // Act
    await abrirDialogo(user);

    // Assert
    const dialogo = screen.getByRole('dialog', { name: '¿Registrar la documentación?' });
    expect(dialogo).toHaveTextContent('Sistema de riego');
    expect(dialogo).toHaveTextContent('Versión 2');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('«Registrar» envía el id de la fila, avisa del éxito y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([ENTREGABLE]) });
    const mutate = mockRegistrar(
      vi.fn((_id: string, opciones: OpcionesMutate) => opciones.onSuccess?.()),
    );
    render(<ConsultarEntregablesDisponibles />);

    // Act
    await abrirDialogo(user);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith('e-1', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Documentación registrada', 'Sistema de riego');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('si la fila registrada era la única de una página posterior vuelve a la anterior', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([ENTREGABLE]), page: 2 });
    mockRegistrar(vi.fn((_id: string, opciones: OpcionesMutate) => opciones.onSuccess?.()));
    render(<ConsultarEntregablesDisponibles />);

    // Act
    await abrirDialogo(user);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    // Assert
    expect(hook.goToPage).toHaveBeenCalledWith(1);
  });

  it('ante un error avisa con el mensaje del servidor y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([ENTREGABLE]) });
    mockRegistrar(
      vi.fn((_id: string, opciones: OpcionesMutate) =>
        opciones.onError?.(
          errorApi(422, {
            errorCode: 'DOCUMENTACION_YA_REGISTRADA',
            message: 'El entregable ya tiene una documentación registrada',
          }),
        ),
      ),
    );
    render(<ConsultarEntregablesDisponibles />);

    // Act
    await abrirDialogo(user);
    await user.click(screen.getByRole('button', { name: 'Registrar' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo registrar la documentación',
      'El entregable ya tiene una documentación registrada',
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mientras registra el botón queda en «Procesando...» y «Cancelar» deshabilitado', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([ENTREGABLE]) });
    mockRegistrar(vi.fn(), true);
    render(<ConsultarEntregablesDisponibles />);

    // Act
    await abrirDialogo(user);

    // Assert
    expect(screen.getByRole('button', { name: /Procesando/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
