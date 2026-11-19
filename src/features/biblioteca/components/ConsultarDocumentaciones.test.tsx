import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../test-utils/render';
import ConsultarDocumentaciones from './ConsultarDocumentaciones';
import { useDocumentaciones } from '../hooks/useDocumentaciones';
import { useEstadosDocumentacion } from '../hooks/useEstadosDocumentacion';
import { useAutoresDocumentacion } from '../hooks/useAutoresDocumentacion';
import { useDescargarDocumentacion } from '../hooks/useDescargarDocumentacion';
import { useCompartirDocumentacion } from '../hooks/useCompartirDocumentacion';
import { bibliotecaService } from '../services/bibliotecaService';
import { toast } from '../../../shared/hooks/useToast';
import type { Page } from '../../../shared/models/api-response';
import type { Documentacion } from '../models/Documentacion';

vi.mock('../hooks/useDocumentaciones', () => ({
  useDocumentaciones: vi.fn(),
}));
vi.mock('../hooks/useEstadosDocumentacion', () => ({
  useEstadosDocumentacion: vi.fn(),
}));

vi.mock('../hooks/useAutoresDocumentacion', () => ({
  useAutoresDocumentacion: vi.fn(),
}));
vi.mock('../hooks/useDescargarDocumentacion', () => ({
  useDescargarDocumentacion: vi.fn(),
}));

vi.mock('../hooks/useCompartirDocumentacion', () => ({
  useCompartirDocumentacion: vi.fn(),
}));

vi.mock('../services/bibliotecaService', () => ({
  bibliotecaService: { cambiarEstadoDocumentacion: vi.fn() },
}));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const DOCUMENTACION: Documentacion = {
  id: 'd-1',
  tituloProyecto: 'Sistema de Gestión Académica',
  autores: [{ id: 'a-1', identificador: 'ana', nombre: 'Ana Pérez' }],
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 2 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};

function crearPagina(
  content: Documentacion[],
  { totalPages = 1, totalElements = content.length } = {},
) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: content.length === 0,
  } as Page<Documentacion>;
}

function mockHook(parcial: Partial<ReturnType<typeof useDocumentaciones>> = {}) {
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
    estadoIds: [],
    toggleEstado: vi.fn(),
    limpiarEstados: vi.fn(),
    ordenDireccion: 'DESC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useDocumentaciones>;
  vi.mocked(useDocumentaciones).mockReturnValue(hook);
  return hook;
}

function mockCatalogo(data?: { id: string; nombre: string; descripcion: string }[]) {
  vi.mocked(useEstadosDocumentacion).mockReturnValue({
    data,
  } as ReturnType<typeof useEstadosDocumentacion>);
}

function mockAutores(parcial: Partial<ReturnType<typeof useAutoresDocumentacion>> = {}) {
  const hook = {
    data: [],
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useAutoresDocumentacion>;
  vi.mocked(useAutoresDocumentacion).mockReturnValue(hook);
  return hook;
}

function mockDescarga(parcial: Partial<ReturnType<typeof useDescargarDocumentacion>> = {}) {
  const hook = { descargar: vi.fn(), descargando: false, ...parcial };
  vi.mocked(useDescargarDocumentacion).mockReturnValue(hook);
  return hook;
}

function mockCompartir(parcial: Partial<ReturnType<typeof useCompartirDocumentacion>> = {}) {
  const hook = {
    compartir: vi.fn(),
    compartiendo: false,
    enlaceCompartido: null,
    cerrarEnlaceCompartido: vi.fn(),
    ...parcial,
  };
  vi.mocked(useCompartirDocumentacion).mockReturnValue(hook);
  return hook;
}

describe('ConsultarDocumentaciones', () => {
  beforeEach(() => {
    mockDescarga();
    mockCompartir();
    vi.mocked(useDocumentaciones).mockReset();
    vi.mocked(useEstadosDocumentacion).mockReset();
    mockCatalogo(undefined);
    vi.mocked(useAutoresDocumentacion).mockReset();
    mockAutores();
    vi.mocked(bibliotecaService.cambiarEstadoDocumentacion).mockReset();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las documentaciones',
    );
    expect(hook.refetch).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('resume el total con singular y plural y lista las documentaciones', () => {
    // Arrange
    mockHook({ data: crearPagina([DOCUMENTACION]) });
    const { rerender } = render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Assert
    expect(screen.getByText('1 documentación')).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Documentaciones' })).getByText('Laura Gómez'),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('table', { name: 'Documentaciones' })).getByText(
        'Sistema de Gestión Académica',
      ),
    ).toBeInTheDocument();

    // Act
    mockHook({ data: crearPagina([DOCUMENTACION], { totalElements: 12, totalPages: 2 }) });
    rerender(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Assert
    expect(screen.getByText('12 documentaciones')).toBeInTheDocument();
  });

  it('con permiso los chips salen del catálogo y alternar uno envía su id', async () => {
    // Arrange
    const user = userEvent.setup();
    mockCatalogo([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'PUBLICADO', nombre: 'Publicado', descripcion: '' },
    ]);
    const hook = mockHook({ data: crearPagina([DOCUMENTACION]) });
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Act
    await user.click(
      within(screen.getByRole('group', { name: 'Estado' })).getByRole('button', {
        name: 'Pendiente',
      }),
    );

    // Assert
    expect(hook.toggleEstado).toHaveBeenCalledWith('PENDIENTE');
    expect(useEstadosDocumentacion).toHaveBeenCalledWith(true);
  });

  it('sin permiso no hay barra de filtros aunque haya catálogo y no se habilita su consulta', () => {
    // Arrange
    mockCatalogo([{ id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' }]);
    mockHook({ data: crearPagina([DOCUMENTACION]) });

    // Act
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Assert
    expect(screen.queryByRole('group', { name: 'Estado' })).not.toBeInTheDocument();
    expect(useEstadosDocumentacion).toHaveBeenCalledWith(false);
  });

  it('con permiso "Ver autores" abre el panel de esa documentación y cerrarlo lo quita', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([DOCUMENTACION]) });
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores
        puedeCambiarEstado={false}
      />,
    );

    // Act
    await user.click(
      within(screen.getByRole('table', { name: 'Documentaciones' })).getByRole('button', {
        name: 'Acciones de la documentación, versión 2',
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver autores' }));

    // Assert
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useAutoresDocumentacion).toHaveBeenCalledWith('d-1');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sin permiso no hay acción "Ver autores" en el menú ni se consulta a los autores', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([DOCUMENTACION]) });
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Act
    await user.click(
      within(screen.getByRole('table', { name: 'Documentaciones' })).getByRole('button', {
        name: 'Acciones de la documentación, versión 2',
      }),
    );

    // Assert
    expect(screen.queryByRole('menuitem', { name: 'Ver autores' })).not.toBeInTheDocument();
    expect(useAutoresDocumentacion).not.toHaveBeenCalled();
  });

  it.each([
    { descargando: false, caso: 'invoca la descarga con la documentación de esa fila' },
    { descargando: true, caso: 'queda deshabilitada mientras descarga' },
  ])('"Descargar" $caso', async ({ descargando }) => {
    // Arrange
    const user = userEvent.setup();
    const descarga = mockDescarga({ descargando });
    mockHook({ data: crearPagina([DOCUMENTACION]) });
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Act
    await user.click(
      within(screen.getByRole('table', { name: 'Documentaciones' })).getByRole('button', {
        name: 'Acciones de la documentación, versión 2',
      }),
    );
    const opcion = screen.getByRole('menuitem', { name: 'Descargar' });
    await user.click(opcion);

    // Assert
    if (descargando) {
      expect(opcion).toBeDisabled();
      expect(descarga.descargar).not.toHaveBeenCalled();
    } else {
      expect(descarga.descargar).toHaveBeenCalledWith(DOCUMENTACION);
    }
  });

  it('"Compartir" invoca el hook con la documentación de esa fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const compartir = mockCompartir();
    mockHook({ data: crearPagina([DOCUMENTACION]) });
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Act
    await user.click(
      within(screen.getByRole('table', { name: 'Documentaciones' })).getByRole('button', {
        name: 'Acciones de la documentación, versión 2',
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Compartir' }));

    // Assert
    expect(compartir.compartir).toHaveBeenCalledWith(DOCUMENTACION);
  });

  it('con enlaceCompartido abre el panel y cerrarlo llama al hook', async () => {
    // Arrange
    const user = userEvent.setup();
    const compartir = mockCompartir({
      enlaceCompartido: {
        documentacion: DOCUMENTACION,
        enlace: { url: 'https://s3.test/d', expiraEn: '2026-11-17T10:00:00Z' },
      },
    });
    mockHook({ data: crearPagina([DOCUMENTACION]) });

    // Act
    render(
      <ConsultarDocumentaciones
        puedeFiltrarPorEstado={false}
        puedeVerAutores={false}
        puedeCambiarEstado={false}
      />,
    );

    // Assert
    expect(screen.getByRole('textbox', { name: 'Enlace para compartir' })).toHaveValue(
      'https://s3.test/d',
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(compartir.cerrarEnlaceCompartido).toHaveBeenCalled();
  });

  describe('cambio de estado', () => {
    function mockMutacion(resultado: 'exito' | 'error') {
      const cambiar = vi.mocked(bibliotecaService.cambiarEstadoDocumentacion);
      if (resultado === 'exito') cambiar.mockResolvedValue(undefined);
      else cambiar.mockRejectedValue(new Error('fallo'));
      return cambiar;
    }

    async function abrirDialogo(user: ReturnType<typeof userEvent.setup>) {
      render(
        <ConsultarDocumentaciones
          puedeFiltrarPorEstado={false}
          puedeVerAutores={false}
          puedeCambiarEstado
        />,
      );
      await user.click(
        within(screen.getByRole('table', { name: 'Documentaciones' })).getByRole('button', {
          name: 'Acciones de la documentación, versión 2',
        }),
      );
      await user.click(screen.getByRole('menuitem', { name: 'Marcar como no publicada' }));
    }

    beforeEach(() => {
      mockHook({ data: crearPagina([DOCUMENTACION]) });
    });

    it('elegir una acción abre el diálogo con título y versión, y cancelar no cambia nada', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = mockMutacion('exito');

      // Act
      await abrirDialogo(user);

      // Assert
      const dialogo = within(screen.getByRole('alertdialog'));
      expect(dialogo.getByText('¿Marcar como no publicada?')).toBeInTheDocument();
      expect(dialogo.getByText('Sistema de Gestión Académica · Versión 2')).toBeInTheDocument();

      // Act
      await user.click(dialogo.getByRole('button', { name: 'Cancelar' }));

      // Assert
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(mutate).not.toHaveBeenCalled();
    });

    it('confirmar envía el destino, avisa con un toast de éxito y cierra el diálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = mockMutacion('exito');
      await abrirDialogo(user);

      // Act
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', {
          name: 'Marcar como no publicada',
        }),
      );

      // Assert
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(mutate).toHaveBeenCalledWith('d-1', { estado: 'NO_PUBLICADO' });
      expect(toast.success).toHaveBeenCalledWith(
        'Documentación marcada como no publicada',
        'Sistema de Gestión Académica',
      );
    });

    it('si el cambio falla muestra un toast de error y cierra el diálogo', async () => {
      // Arrange
      const user = userEvent.setup();
      mockMutacion('error');
      await abrirDialogo(user);

      // Act
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', {
          name: 'Marcar como no publicada',
        }),
      );

      // Assert
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo marcar como no publicada',
        expect.any(String),
      );
    });

    it.each([
      {
        caso: 'sale por el filtro y era la única de una página posterior',
        page: 1,
        estadoIds: ['PUBLICADO'],
        filas: 1,
        retrocede: true,
      },
      {
        caso: 'sale por el filtro pero está en la primera página',
        page: 0,
        estadoIds: ['PUBLICADO'],
        filas: 1,
        retrocede: false,
      },
      {
        caso: 'el filtro incluye el estado destino',
        page: 1,
        estadoIds: ['NO_PUBLICADO'],
        filas: 1,
        retrocede: false,
      },
      {
        caso: 'quedan más filas en la página',
        page: 1,
        estadoIds: ['PUBLICADO'],
        filas: 2,
        retrocede: false,
      },
    ])(
      'al confirmar, retrocede de página solo cuando $caso: $retrocede',
      async ({ page, estadoIds, filas, retrocede }) => {
        // Arrange
        const user = userEvent.setup();
        mockMutacion('exito');
        const otra: Documentacion = {
          ...DOCUMENTACION,
          id: 'd-2',
          entregableProyectoGrado: { id: 'e-2', versionEntregable: 3 },
        };
        const contenido = filas === 1 ? [DOCUMENTACION] : [DOCUMENTACION, otra];
        const hook = mockHook({ data: crearPagina(contenido), page, estadoIds });
        await abrirDialogo(user);

        // Act
        await user.click(
          within(screen.getByRole('alertdialog')).getByRole('button', {
            name: 'Marcar como no publicada',
          }),
        );

        // Assert
        await waitFor(() => expect(toast.success).toHaveBeenCalled());
        if (retrocede) expect(hook.goToPage).toHaveBeenCalledWith(0);
        else expect(hook.goToPage).not.toHaveBeenCalled();
      },
    );

    it('sin permiso no hay acciones de estado', () => {
      // Arrange
      mockMutacion('exito');

      // Act
      render(
        <ConsultarDocumentaciones
          puedeFiltrarPorEstado={false}
          puedeVerAutores
          puedeCambiarEstado={false}
        />,
      );

      // Assert
      expect(screen.queryByRole('menuitem', { name: 'Publicar' })).not.toBeInTheDocument();
    });
  });
});
