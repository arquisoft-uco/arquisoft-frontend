import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import type { Page } from '../../../../shared/models/api-response';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { artefactosService } from '../../services/artefactosService';
import ConsultarVersionesArtefactoAsesor from './ConsultarVersionesArtefactoAsesor';
vi.mock('../../../../shared/hooks/useDescargarVersionRepositorio', () => ({
  useDescargarVersionRepositorio: () => ({ descargar: vi.fn(), descargando: false }),
}));

vi.mock('../../services/artefactosService', () => ({
  artefactosService: {
    consultarVersionesArtefactoAsesor: vi.fn(),
    getEstadosRevisionAsesor: vi.fn(),
    getVersionArtefacto: vi.fn(),
    getIdsArtefactosOmitidosAsesor: vi.fn(),
    registrarRevision: vi.fn(),
    enviarRevision: vi.fn(),
    getObservacionesRevision: vi.fn(),
    registrarObservacion: vi.fn(),
    eliminarObservacion: vi.fn(),
  },
}));

const getVersion = vi.mocked(artefactosService.getVersionArtefacto);
const getEstados = vi.mocked(artefactosService.getEstadosRevisionAsesor);
const getOmitidos = vi.mocked(artefactosService.getIdsArtefactosOmitidosAsesor);
const registrarRevision = vi.mocked(artefactosService.registrarRevision);
const enviarRevision = vi.mocked(artefactosService.enviarRevision);
const getObservaciones = vi.mocked(artefactosService.getObservacionesRevision);
const registrarObservacion = vi.mocked(artefactosService.registrarObservacion);

const consultarVersiones = vi.mocked(artefactosService.consultarVersionesArtefactoAsesor);

const VERSION: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
  fechaCreacionRevision: null,
};

function pagina<T>(content: T[]): Page<T> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    page: 0,
    size: 10,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('ConsultarVersionesArtefactoAsesor', () => {
  afterEach(() => {
    restaurarTemporizadores();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    consultarVersiones.mockResolvedValue(pagina([VERSION]));
    getEstados.mockResolvedValue([]);
    getOmitidos.mockResolvedValue([]);
  });

  it('mientras carga muestra el estado de carga accesible', () => {
    // Arrange
    consultarVersiones.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<ConsultarVersionesArtefactoAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con datos muestra proyecto, documento y repositorio sin la columna Asesor y con la búsqueda habilitada', async () => {
    // Act
    render(<ConsultarVersionesArtefactoAsesor />);

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
    expect(await within(tabla).findByText('Acta de inicio')).toBeInTheDocument();
    expect(within(tabla).getByText('Sistema de riego')).toBeInTheDocument();
    expect(within(tabla).getByText('Versión 2 del documento')).toBeInTheDocument();
    expect(within(tabla).getByText('Repositorio base')).toBeInTheDocument();
    expect(within(tabla).getByText('Versión 4')).toBeInTheDocument();
    expect(within(tabla).queryByText('Marta Gómez')).not.toBeInTheDocument();
    expect(within(tabla).queryByRole('columnheader', { name: 'Asesor' })).not.toBeInTheDocument();
    expect(screen.getByText('1 versión')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Buscar artefactos' })).toBeEnabled();
  });

  it('sin versiones muestra el vacío informativo', async () => {
    // Arrange
    consultarVersiones.mockResolvedValue(pagina([]));

    // Act
    render(<ConsultarVersionesArtefactoAsesor />);

    // Assert
    expect(await screen.findByText('Aún no hay versiones de artefactos')).toBeInTheDocument();
  });

  it('ante un error muestra el aviso y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultarVersiones.mockRejectedValueOnce(new Error('fallo de red'));
    render(<ConsultarVersionesArtefactoAsesor />);

    // Act
    const aviso = await screen.findByRole('alert');
    expect(within(aviso).getByText('No se pudieron cargar las versiones')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(
      await screen.findByRole('table', { name: 'Versiones de artefactos' }),
    ).toBeInTheDocument();
    const consultasDelListado = consultarVersiones.mock.calls.filter(([req]) => req.tamanio !== 1);
    expect(consultasDelListado).toHaveLength(2);
  });

  it('elegir un rango desde el botón de fechas consulta con el criterio y el botón muestra el rango', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarVersionesArtefactoAsesor />);
    await screen.findByRole('table', { name: 'Versiones de artefactos' });
    await user.click(screen.getByRole('button', { name: 'Fecha de creación', expanded: false }));
    const panel = within(screen.getByRole('dialog', { name: 'Fecha de creación' }));

    // Act
    await user.type(panel.getByLabelText('Desde'), '2026-03-01');
    await user.type(panel.getByLabelText('Hasta'), '2026-03-31');

    // Assert
    expect(consultarVersiones).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pagina: 0,
        filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'AND' }),
      }),
    );
    expect(
      await screen.findByRole('button', { name: 'Fecha de creación: 01/03/2026 – 31/03/2026' }),
    ).toBeInTheDocument();
  });

  it('escribir en "Buscar artefactos" consulta con CONTIENE sobre documento y proyecto', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    render(<ConsultarVersionesArtefactoAsesor />);
    await screen.findByRole('table', { name: 'Versiones de artefactos' });

    // Act
    await user.type(screen.getByRole('textbox', { name: 'Buscar artefactos' }), 'acta');
    avanzar(300);

    // Assert
    await waitFor(() =>
      expect(consultarVersiones).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtros: expect.objectContaining({ tipo: 'GRUPO', conector: 'OR' }),
        }),
      ),
    );
  });

  it('un texto sin coincidencias consulta al backend, muestra "Sin resultados" y "Limpiar filtros" restablece', async () => {
    // Arrange
    const user = userEvent.setup();
    consultarVersiones.mockImplementation(({ filtros }) =>
      Promise.resolve(pagina(filtros ? [] : [VERSION])),
    );
    render(<ConsultarVersionesArtefactoAsesor />, { initialPath: '/artefactos?q=zzz' });

    // Assert
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
    expect(consultarVersiones).toHaveBeenCalled();

    // Act
    await user.click(screen.getByRole('button', { name: /limpiar filtros/i }));

    // Assert
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
    expect(await within(tabla).findByText('Acta de inicio')).toBeInTheDocument();
  });

  it('con el catálogo muestra los chips "Sin revisión" y estados, y alternar uno consulta con el filtro', async () => {
    // Arrange
    const user = userEvent.setup();
    getEstados.mockResolvedValue([
      { id: 'PENDIENTE', nombre: 'Pendiente', descripcion: '' },
      { id: 'RESUELTA', nombre: 'Resuelta', descripcion: '' },
    ]);
    render(<ConsultarVersionesArtefactoAsesor />);

    // Act
    await user.click(await screen.findByRole('button', { name: 'Sin revisión' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Pendiente' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resuelta' })).toBeInTheDocument();
    await waitFor(() =>
      expect(consultarVersiones).toHaveBeenLastCalledWith(
        expect.objectContaining({
          filtros: expect.objectContaining({ tipo: 'PREDICADO', campo: 'estadoRevision' }),
        }),
      ),
    );
  });

  it('sin catálogo no hay chips de estado y la tabla funciona igual', async () => {
    // Arrange
    getEstados.mockRejectedValue(new Error('falla'));

    // Act
    render(<ConsultarVersionesArtefactoAsesor />);

    // Assert
    expect(
      await screen.findByRole('table', { name: 'Versiones de artefactos' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sin revisión' })).not.toBeInTheDocument();
  });

  it('con ?artefacto=<uuid> muestra la insignia "Artefacto: …" y se puede quitar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ConsultarVersionesArtefactoAsesor />, {
      initialPath: '/artefactos?artefacto=3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b',
    });

    // Act
    await user.click(await screen.findByRole('button', { name: /Artefacto: Acta de inicio/ }));

    // Assert
    expect(
      screen.queryByRole('button', { name: /Artefacto: Acta de inicio/ }),
    ).not.toBeInTheDocument();
  });

  it('"Ver información" abre el panel con los datos de la versión y cerrarlo conserva la lista', async () => {
    // Arrange
    const user = userEvent.setup();
    consultarVersiones.mockResolvedValue(pagina([VERSION]));
    getVersion.mockResolvedValue({ ...VERSION, uriArchivo: 'almacen/acta-v4.pdf' });
    render(<ConsultarVersionesArtefactoAsesor />);
    const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });

    // Act
    await user.click(
      await within(tabla).findByRole('button', {
        name: 'Acciones de la versión 4 de Acta de inicio',
      }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Ver información' }));

    // Assert
    expect(await screen.findByText('almacen/acta-v4.pdf')).toBeInTheDocument();
    expect(getVersion).toHaveBeenCalledWith('v-1');

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(screen.queryByText('almacen/acta-v4.pdf')).not.toBeInTheDocument());
    expect(screen.getByRole('table', { name: 'Versiones de artefactos' })).toBeInTheDocument();
  });

  describe('registrar revisión (HU-114)', () => {
    const ANTERIOR: VersionArtefacto = { ...VERSION, id: 'v-0', version: 3 };
    const CONTROL: VersionArtefacto = {
      ...VERSION,
      id: 'v-9',
      artefacto: 'a-2',
      nombreDocumento: 'Plano',
    };

    function listarConUltimas(filas: VersionArtefacto[], ultimas: VersionArtefacto[]) {
      consultarVersiones.mockImplementation(({ tamanio, filtros }) => {
        if (tamanio !== 1) return Promise.resolve(pagina(filas));
        const pedido = JSON.stringify(filtros);
        return Promise.resolve(pagina(ultimas.filter((u) => pedido.includes(u.artefacto))));
      });
    }

    async function abrirMenu(user: UserEvent, version: number, documento = 'Acta de inicio') {
      const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
      await user.click(
        await within(tabla).findByRole('button', {
          name: `Acciones de la versión ${version} de ${documento}`,
        }),
      );
    }

    async function comprobarControlPositivo(user: UserEvent, version: number, documento: string) {
      await abrirMenu(user, version, documento);
      expect(await screen.findByRole('menuitem', { name: 'Registrar revisión' })).toBeVisible();
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    }

    it('la ofrece en la última versión sin revisión; confirmar registra por el id de la fila y abre el panel de la revisión creada', async () => {
      // Arrange
      listarConUltimas([VERSION, ANTERIOR], [VERSION]);
      registrarRevision.mockResolvedValue({ id: 'r-1' });
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);

      // Act
      await abrirMenu(user, 4);
      await user.click(await screen.findByRole('menuitem', { name: 'Registrar revisión' }));
      await user.click(
        within(screen.getByRole('dialog', { name: '¿Registrar revisión?' })).getByRole('button', {
          name: 'Registrar revisión',
        }),
      );

      // Assert
      await waitFor(() => expect(registrarRevision).toHaveBeenCalledWith('v-1'));
      await waitFor(() =>
        expect(
          screen.queryByRole('dialog', { name: '¿Registrar revisión?' }),
        ).not.toBeInTheDocument(),
      );
      expect(
        await screen.findByRole('heading', { name: 'Gestionar revisión' }),
      ).toBeInTheDocument();
      await waitFor(() => expect(getObservaciones).toHaveBeenCalledWith('r-1'));
    });

    it('con la revisión cerrada ofrece «Reabrir revisión» en vez de «Registrar revisión» y abre el diálogo de reapertura', async () => {
      // Arrange
      const cerrada = {
        ...VERSION,
        revisionAsesor: 'r-1',
        estadoRevision: 'CERRADA',
        nombreEstadoRevision: 'Cerrada',
      };
      listarConUltimas([cerrada], [cerrada]);
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);

      // Act
      await abrirMenu(user, 4);
      const accion = await screen.findByRole('menuitem', { name: 'Reabrir revisión' });
      expect(
        screen.queryByRole('menuitem', { name: 'Registrar revisión' }),
      ).not.toBeInTheDocument();
      await user.click(accion);

      // Assert
      expect(
        screen.getByRole('dialog', { name: '¿Reabrir la revisión de esta versión?' }),
      ).toBeInTheDocument();
    });

    it('no la ofrece en una versión anterior aunque sí en la última', async () => {
      // Arrange
      listarConUltimas([VERSION, ANTERIOR], [VERSION]);
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);
      await comprobarControlPositivo(user, 4, 'Acta de inicio');

      // Act
      await abrirMenu(user, 3);

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Registrar revisión' }),
      ).not.toBeInTheDocument();
    });

    it('no la ofrece con una revisión pendiente aunque sí en otra fila elegible', async () => {
      // Arrange
      const pendiente = { ...VERSION, revisionAsesor: 'r-1', estadoRevision: 'PENDIENTE' };
      listarConUltimas([pendiente, CONTROL], [pendiente, CONTROL]);
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);
      await comprobarControlPositivo(user, 4, 'Plano');

      // Act
      await abrirMenu(user, 4, 'Acta de inicio');

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Registrar revisión' }),
      ).not.toBeInTheDocument();
    });

    it('no la ofrece en un artefacto omitido aunque sí en otra fila elegible', async () => {
      // Arrange
      listarConUltimas([VERSION, CONTROL], [VERSION, CONTROL]);
      getOmitidos.mockResolvedValue([VERSION.artefacto]);
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);
      await comprobarControlPositivo(user, 4, 'Plano');

      // Act
      await abrirMenu(user, 4, 'Acta de inicio');

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Registrar revisión' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('gestionar revisión (HU-292-AJ1)', () => {
    const PENDIENTE: VersionArtefacto = {
      ...VERSION,
      revisionAsesor: 'r-1',
      estadoRevision: 'PENDIENTE',
      nombreEstadoRevision: 'Pendiente',
    };
    const RESUELTA: VersionArtefacto = {
      ...VERSION,
      id: 'v-2',
      artefacto: 'a-3',
      nombreDocumento: 'Informe',
      revisionAsesor: 'r-2',
      estadoRevision: 'RESUELTA',
      nombreEstadoRevision: 'Resuelta',
    };
    const SIN_REVISION: VersionArtefacto = {
      ...VERSION,
      id: 'v-9',
      artefacto: 'a-2',
      nombreDocumento: 'Plano',
    };

    async function abrirMenu(user: UserEvent, documento: string) {
      const tabla = await screen.findByRole('table', { name: 'Versiones de artefactos' });
      await user.click(
        await within(tabla).findByRole('button', {
          name: `Acciones de la versión 4 de ${documento}`,
        }),
      );
    }

    beforeEach(() => {
      getObservaciones.mockResolvedValue([]);
    });

    it('ofrece una sola acción «Gestionar revisión» en cualquier estado, también con el artefacto omitido, y nunca las anteriores', async () => {
      // Arrange
      consultarVersiones.mockResolvedValue(pagina([PENDIENTE, RESUELTA]));
      getOmitidos.mockResolvedValue(['a-1']);
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);

      for (const documento of ['Acta de inicio', 'Informe']) {
        // Act
        await abrirMenu(user, documento);

        // Assert
        expect(
          await screen.findByRole('menuitem', { name: 'Gestionar revisión' }),
        ).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: /observaciones/ })).not.toBeInTheDocument();
        expect(screen.queryByRole('menuitem', { name: 'Enviar revisión' })).not.toBeInTheDocument();
        await user.keyboard('{Escape}');
      }
    });

    it('sin revisión no hay «Gestionar revisión» aunque sí en otra fila con revisión', async () => {
      // Arrange
      consultarVersiones.mockResolvedValue(pagina([SIN_REVISION, PENDIENTE]));
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);
      await abrirMenu(user, 'Acta de inicio');
      expect(await screen.findByRole('menuitem', { name: 'Gestionar revisión' })).toBeVisible();
      await user.keyboard('{Escape}');

      // Act
      await abrirMenu(user, 'Plano');

      // Assert
      expect(screen.getByRole('menuitem', { name: 'Ver información' })).toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Gestionar revisión' }),
      ).not.toBeInTheDocument();
    });

    it('de punta a punta: abre el panel, agrega una observación con el id de la revisión de la fila', async () => {
      // Arrange
      consultarVersiones.mockResolvedValue(pagina([PENDIENTE]));
      registrarObservacion.mockResolvedValue({ id: 'o-1' });
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);
      await abrirMenu(user, 'Acta de inicio');
      await user.click(await screen.findByRole('menuitem', { name: 'Gestionar revisión' }));

      // Act
      await user.click(await screen.findByRole('button', { name: 'Agregar observación' }));
      await user.type(screen.getByRole('textbox', { name: /Descripción/ }), 'Falta el diagrama');
      await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

      // Assert
      await waitFor(() =>
        expect(registrarObservacion).toHaveBeenCalledWith('r-1', {
          descripcion: 'Falta el diagrama',
        }),
      );
      expect(getObservaciones).toHaveBeenCalledWith('r-1');
    });

    it('de punta a punta: desde el panel enviar abre la confirmación y confirmar envía por el id de la revisión', async () => {
      // Arrange
      consultarVersiones.mockResolvedValue(pagina([PENDIENTE]));
      getObservaciones.mockResolvedValue([
        {
          id: 'o-1',
          revisionAsesorId: 'r-1',
          descripcion: 'Falta el diagrama',
          estadoId: 'NUEVA',
          estadoNombre: 'Nueva',
        },
      ]);
      enviarRevision.mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<ConsultarVersionesArtefactoAsesor />);
      await abrirMenu(user, 'Acta de inicio');
      await user.click(await screen.findByRole('menuitem', { name: 'Gestionar revisión' }));
      const enviar = await screen.findByRole('button', { name: 'Enviar revisión' });
      await waitFor(() => expect(enviar).toBeEnabled());

      // Act
      await user.click(enviar);
      const dialogo = screen.getByRole('dialog', { name: '¿Enviar revisión?' });
      await user.click(within(dialogo).getByRole('button', { name: 'Enviar revisión' }));

      // Assert
      await waitFor(() => expect(enviarRevision).toHaveBeenCalledWith('r-1'));
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Gestionar revisión' })).toBeNull(),
      );
    });
  });
});
