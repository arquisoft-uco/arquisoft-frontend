import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import { usePuedeGestionarObservaciones } from '../../hooks/usePuedeGestionarObservaciones';
import { useRegistrarObservacion } from '../../hooks/useRegistrarObservacion';
import { useEliminarObservacion } from '../../hooks/useEliminarObservacion';
import { useUltimaVersionArtefacto } from '../../hooks/useUltimaVersionArtefacto';
import { useObservacionEnEliminacion } from '../../hooks/useObservacionEnEliminacion';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import { toast } from '../../../../shared/hooks/useToast';
import { useCerrarRevision } from '../../hooks/useCerrarRevision';
import { useEnviarRevision } from '../../hooks/useEnviarRevision';
import { useEliminarRevision } from '../../hooks/useEliminarRevision';
import { useCambiarEstadoObservacion } from '../../hooks/useCambiarEstadoObservacion';
import { useRevisionAnterior } from '../../hooks/useRevisionAnterior';
import { errorApi } from '../../../../test-utils/errores-api';
import GestionarRevisionPanel from './GestionarRevisionPanel';

vi.mock('../../hooks/useObservacionesRevision', () => ({
  useObservacionesRevision: vi.fn(),
}));

vi.mock('../../hooks/usePuedeGestionarObservaciones', () => ({
  usePuedeGestionarObservaciones: vi.fn(),
}));
vi.mock('../../hooks/useRegistrarObservacion', () => ({ useRegistrarObservacion: vi.fn() }));
vi.mock('../../hooks/useEliminarObservacion', () => ({ useEliminarObservacion: vi.fn() }));
vi.mock('../../hooks/useObservacionEnEliminacion', () => ({
  useObservacionEnEliminacion: vi.fn(() => false),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('../../hooks/useUltimaVersionArtefacto', () => ({
  useUltimaVersionArtefacto: vi.fn(() => ({
    ultimaVersion: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));
vi.mock('../../hooks/useCambiarEstadoObservacion', () => ({
  useCambiarEstadoObservacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('../../hooks/useRevisionAnterior', () => ({
  useRevisionAnterior: vi.fn(() => ({ visible: false })),
}));
vi.mock('../../hooks/useCerrarRevision', () => ({
  useCerrarRevision: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('../../hooks/useEnviarRevision', () => ({
  useEnviarRevision: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('../../hooks/useEliminarRevision', () => ({
  useEliminarRevision: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const hook = vi.mocked(useObservacionesRevision);
const mutate = vi.fn();

type Resultado = ReturnType<typeof useObservacionesRevision>;

function estado(parcial: Partial<Resultado>): Resultado {
  const base: Partial<Resultado> = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  return Object.assign(base, parcial) as Resultado;
}

const nueva: ObservacionRevision = {
  id: 'o-1',
  revisionAsesorId: 'r-1',
  descripcion: 'Falta el diagrama de despliegue',
  estadoId: 'NUEVA',
  estadoNombre: 'Nueva',
};

const solucionada: ObservacionRevision = {
  ...nueva,
  id: 'o-2',
  descripcion: 'Corregir la portada',
  estadoId: 'SOLUCIONADA',
  estadoNombre: 'Solucionada',
};

const VERSION: VersionArtefacto = {
  proyectoFinalizado: false,
  proyectoCancelado: false,
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: 'r-1',
  estadoRevision: 'PENDIENTE',
  nombreEstadoRevision: 'Pendiente',
  fechaCreacionRevision: null,
};

const PROPS = { revisionAsesorId: 'r-1', version: VERSION };

function simularOmitidos(omitidos: Set<string> | undefined, puede = false) {
  vi.mocked(usePuedeGestionarObservaciones).mockReturnValue({
    puedeGestionar: vi.fn(() => puede),
    omitidos,
  });
}

function renderEditable() {
  simularOmitidos(new Set(), true);
  return render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);
}

describe('GestionarRevisionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularOmitidos(new Set());
    vi.mocked(useObservacionEnEliminacion).mockReturnValue(false);
    vi.mocked(useRegistrarObservacion).mockReturnValue({
      mutate: vi.fn(),
      reset: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useRegistrarObservacion>> as ReturnType<
      typeof useRegistrarObservacion
    >);
    vi.mocked(useEliminarObservacion).mockReturnValue({
      mutate,
      isPending: false,
    } as Partial<ReturnType<typeof useEliminarObservacion>> as ReturnType<
      typeof useEliminarObservacion
    >);
  });

  async function pedirEliminar(user: ReturnType<typeof userEvent.setup>) {
    renderEditable();
    const menus = screen.getAllByRole('button', { name: 'Acciones de la observación' });
    await user.click(menus[1]);
    await user.click(await screen.findByRole('menuitem', { name: 'Eliminar observación' }));
  }

  it('confirma y elimina la observación de la fila elegida con aviso de éxito', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    mutate.mockImplementation((_id: string, opciones: { onSuccess: () => void }) =>
      opciones.onSuccess(),
    );
    const user = userEvent.setup();

    // Act
    await pedirEliminar(user);
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar observación' }));

    // Assert
    expect(mutate.mock.calls[0][0]).toBe('o-2');
    expect(toast.success).toHaveBeenCalledWith('Observación eliminada');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('el menú de una observación queda dentro del panel con el foco en Eliminar y abre la confirmación', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    const user = userEvent.setup();
    renderEditable();
    const panel = screen.getAllByRole('dialog')[0];

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Acciones de la observación' })[1]);

    // Assert
    const menu = screen.getByRole('menu', { name: 'Acciones de la observación' });
    expect(panel).toContainElement(menu);
    const eliminar = within(menu).getByRole('menuitem', { name: 'Eliminar observación' });
    expect(eliminar).toHaveFocus();

    // Act
    await user.click(eliminar);

    // Assert
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('deshabilita Eliminar observación solo en la fila cuya eliminación está en curso', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    vi.mocked(useObservacionEnEliminacion).mockImplementation((id) => id === 'o-2');
    const user = userEvent.setup();
    renderEditable();
    const menus = screen.getAllByRole('button', { name: 'Acciones de la observación' });

    // Act
    await user.click(menus[1]);

    // Assert
    expect(await screen.findByRole('menuitem', { name: 'Eliminar observación' })).toBeDisabled();

    // Act
    await user.keyboard('{Escape}');
    await user.click(menus[0]);

    // Assert
    expect(await screen.findByRole('menuitem', { name: 'Eliminar observación' })).toBeEnabled();
  });

  it('al cancelar el diálogo no elimina nada', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    const user = userEvent.setup();

    // Act
    await pedirEliminar(user);
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(mutate).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('si el servidor rechaza la eliminación avisa con el motivo y cierra el diálogo', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
    mutate.mockImplementation((_id: string, opciones: { onError: (e: unknown) => void }) =>
      opciones.onError(new Error('422')),
    );
    const user = userEvent.setup();

    // Act
    await pedirEliminar(user);
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Eliminar observación' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo eliminar la observación',
      expect.any(String),
    );
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('muestra el estado de carga accesible mientras consulta', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(hook).toHaveBeenCalledWith('r-1');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista una tarjeta por observación con su descripción y el nombre de su estado', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Observaciones de la revisión' });
    const items = within(lista).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Falta el diagrama de despliegue')).toBeInTheDocument();
    expect(within(items[0]).getByText('Nueva')).toBeInTheDocument();
    expect(within(items[1]).getByText('Corregir la portada')).toBeInTheDocument();
    expect(within(items[1]).getByText('Solucionada')).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío y no un error cuando la revisión no tiene observaciones', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Esta revisión aún no tiene observaciones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error y reintenta la consulta al pulsar Reintentar', async () => {
    // Arrange
    const refetch = vi.fn();
    hook.mockReturnValue(estado({ isError: true, error: new Error('Sin conexión'), refetch }));
    const user = userEvent.setup();

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No pudimos cargar las observaciones')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('llama a onCerrar al pulsar Cerrar', async () => {
    // Arrange
    const onCerrar = vi.fn();
    hook.mockReturnValue(estado({ data: [] }));
    const user = userEvent.setup();

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={onCerrar} />);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  });

  it('muestra el título, la versión, el estado de la revisión y el aviso de pendiente', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));

    // Act
    renderEditable();

    // Assert
    expect(screen.getAllByRole('dialog')[0]).toHaveAccessibleName('Gestionar revisión');
    expect(screen.getByText('«Acta de inicio» · Versión 4')).toBeInTheDocument();
    expect(screen.getByText('Estado de la revisión')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(
      screen.getByText(/Esta revisión está pendiente: agrega las observaciones/),
    ).toBeVisible();
  });

  it('pendiente muestra Agregar observación y un menú de acciones por tarjeta', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));

    // Act
    renderEditable();

    // Assert
    expect(screen.getByRole('button', { name: 'Agregar observación' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Acciones de la observación' })).toHaveLength(2);
  });

  it('Enviar revisión queda deshabilitado con la nota visible mientras no haya observaciones', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    renderEditable();

    // Assert
    const enviar = screen.getByRole('button', { name: 'Enviar revisión' });
    expect(enviar).toBeDisabled();
    expect(enviar).toHaveAccessibleDescription(
      'Agrega al menos una observación para enviar la revisión.',
    );
  });

  it.each([
    ['cargando', { isLoading: true }],
    ['con error', { isError: true, error: new Error('red') }],
  ] as [string, Partial<Resultado>][])(
    'con la lista %s Enviar revisión queda deshabilitado y sin nota',
    (_caso, parcial) => {
      // Arrange
      hook.mockReturnValue(estado(parcial));

      // Act
      renderEditable();

      // Assert
      expect(screen.getByRole('button', { name: 'Enviar revisión' })).toBeDisabled();
      expect(
        screen.queryByText('Agrega al menos una observación para enviar la revisión.'),
      ).not.toBeInTheDocument();
    },
  );

  it('con observaciones Enviar revisión se habilita, sin nota, y confirmar llama la mutación', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    const mutateEnvio = vi.fn();
    vi.mocked(useEnviarRevision).mockReturnValue({
      mutate: mutateEnvio,
      isPending: false,
    } as Partial<ReturnType<typeof useEnviarRevision>> as ReturnType<typeof useEnviarRevision>);
    const user = userEvent.setup();
    renderEditable();

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar revisión' }));
    const dialogo = screen.getByRole('dialog', { name: '¿Enviar revisión?' });
    await user.click(within(dialogo).getByRole('button', { name: 'Enviar revisión' }));

    // Assert
    expect(
      screen.queryByText('Agrega al menos una observación para enviar la revisión.'),
    ).not.toBeInTheDocument();
    expect(mutateEnvio).toHaveBeenCalledWith({ revisionAsesorId: 'r-1' }, expect.any(Object));
  });

  it('si el backend rechaza el envío por falta de observaciones avisa y el panel sigue abierto', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    const onCerrar = vi.fn();
    vi.mocked(useEnviarRevision).mockReturnValue({
      mutate: vi.fn((_v: unknown, o?: { onError?: (e: unknown) => void }) =>
        o?.onError?.(
          errorApi(422, {
            status: 422,
            errorCode: 'REVISION_ASESOR_SIN_OBSERVACIONES',
            message: 'del backend',
          }),
        ),
      ),
      isPending: false,
    } as Partial<ReturnType<typeof useEnviarRevision>> as ReturnType<typeof useEnviarRevision>);
    simularOmitidos(new Set(), true);
    const user = userEvent.setup();
    render(<GestionarRevisionPanel {...PROPS} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar revisión' }));
    await user.click(
      within(screen.getByRole('dialog', { name: '¿Enviar revisión?' })).getByRole('button', {
        name: 'Enviar revisión',
      }),
    );

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo enviar la revisión',
      'La revisión no tiene observaciones. Agrega al menos una para poder enviarla.',
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: '¿Enviar revisión?' })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('dialog', { name: 'Gestionar revisión' })).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('en solo lectura no ofrece enviar y el pie conserva Cerrar', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    simularOmitidos(new Set(['a-1']));

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Enviar revisión' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('pendiente con la lista vacía invita a agregar la primera y deja la acción visible', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    renderEditable();

    // Assert
    expect(screen.getByText('Agrega la primera observación de esta revisión.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar observación' })).toBeInTheDocument();
  });

  it('con una revisión que ya no está pendiente explica que es de solo lectura y no ofrece cambios', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    const version = { ...VERSION, estadoRevision: 'EN_PROGRESO' };

    // Act
    render(<GestionarRevisionPanel {...PROPS} version={version} onCerrar={vi.fn()} />);

    // Assert
    expect(
      screen.getByText(/ya no está pendiente: sus observaciones no se pueden cambiar/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar observación' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Acciones de la observación' }),
    ).not.toBeInTheDocument();
  });

  it('con un artefacto omitido explica el motivo y no ofrece cambios', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    simularOmitidos(new Set(['a-1']));

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(
      screen.getByText('Este artefacto está omitido y no admite cambios.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar observación' })).not.toBeInTheDocument();
  });

  it('mientras el catálogo de omitidos no responde no muestra aviso pero tampoco ofrece cambios', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    simularOmitidos(undefined);

    // Act
    render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar observación' })).not.toBeInTheDocument();
  });

  it('Agregar observación abre el formulario', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    const user = userEvent.setup();
    renderEditable();

    // Act
    await user.click(screen.getByRole('button', { name: 'Agregar observación' }));

    // Assert
    expect(await screen.findByRole('textbox', { name: /Descripción/ })).toBeInTheDocument();
  });

  describe('decisión sobre observaciones solucionadas (HU-137)', () => {
    const RESUELTA = { ...VERSION, estadoRevision: 'RESUELTA', nombreEstadoRevision: 'Resuelta' };
    const SIGUIENTE = { ...RESUELTA, version: 5, revisionAsesor: 'r-5' };

    function simularUltima(ultimaVersion: VersionArtefacto | undefined) {
      vi.mocked(useUltimaVersionArtefacto).mockReturnValue({
        ultimaVersion,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });
    }

    it('solo la observación solucionada tiene menú y reabrir se habilita con la versión siguiente pendiente', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
      simularUltima({ ...SIGUIENTE, estadoRevision: 'PENDIENTE' });
      const user = userEvent.setup();
      render(<GestionarRevisionPanel {...PROPS} version={RESUELTA} onCerrar={vi.fn()} />);

      // Act
      await user.click(
        screen.getByRole('button', { name: /^Acciones de la observación: Corregir la portada/ }),
      );

      // Assert
      expect(screen.getAllByRole('button', { name: /^Acciones de la observación:/ })).toHaveLength(
        1,
      );
      expect(screen.getByRole('menuitem', { name: 'Cerrar observación' })).toBeEnabled();
      expect(screen.getByRole('menuitem', { name: 'Reabrir observación' })).toBeEnabled();
      expect(screen.queryByRole('note')).not.toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('menuitem', { name: 'Cerrar observación' }));

      // Assert
      expect(screen.getByText('¿Cerrar observación?')).toBeInTheDocument();
    });

    it('el menú de decisión queda dentro del panel con el foco en Cerrar y abre su confirmación', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [solucionada] }));
      simularUltima({ ...SIGUIENTE, estadoRevision: 'PENDIENTE' });
      const user = userEvent.setup();
      render(<GestionarRevisionPanel {...PROPS} version={RESUELTA} onCerrar={vi.fn()} />);
      const panel = screen.getAllByRole('dialog')[0];

      // Act
      await user.click(screen.getByRole('button', { name: /^Acciones de la observación:/ }));

      // Assert
      const menu = screen.getByRole('menu');
      expect(panel).toContainElement(menu);
      const cerrar = within(menu).getByRole('menuitem', { name: 'Cerrar observación' });
      expect(cerrar).toHaveFocus();

      // Act
      await user.click(cerrar);

      // Assert
      expect(await screen.findByText('¿Cerrar observación?')).toBeInTheDocument();
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('con la revisión de la versión siguiente ya enviada deshabilita reabrir y explica el motivo', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [solucionada] }));
      simularUltima({ ...SIGUIENTE, estadoRevision: 'EN_PROGRESO' });
      const user = userEvent.setup();
      render(<GestionarRevisionPanel {...PROPS} version={RESUELTA} onCerrar={vi.fn()} />);

      // Act
      await user.click(screen.getByRole('button', { name: /^Acciones de la observación:/ }));

      // Assert
      expect(screen.getByText(/La revisión de la versión 5 ya se envió/)).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Reabrir observación' })).toBeDisabled();
      expect(screen.getByRole('menuitem', { name: 'Cerrar observación' })).toBeEnabled();
    });

    it('con artefacto omitido no hay menú de decisión y se explica el motivo', () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [solucionada] }));
      simularOmitidos(new Set(['a-1']));
      simularUltima(undefined);

      // Act
      render(<GestionarRevisionPanel {...PROPS} version={RESUELTA} onCerrar={vi.fn()} />);

      // Assert
      expect(
        screen.queryByRole('button', { name: /^Acciones de la observación:/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Este artefacto está omitido y no admite cambios.'),
      ).toBeInTheDocument();
    });
  });

  describe('observaciones de la revisión anterior (HU-292-AJ2)', () => {
    const ANTERIOR_V = { ...VERSION, id: 'v-0', version: 3, revisionAsesor: 'r-0' };
    const previa: ObservacionRevision = {
      ...solucionada,
      id: 'o-9',
      revisionAsesorId: 'r-0',
      descripcion: 'Ajustar el cronograma anterior',
    };

    function simularAnterior() {
      vi.mocked(useRevisionAnterior).mockReturnValue({
        visible: true,
        versionAnterior: ANTERIOR_V,
        observaciones: [previa],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        total: 1,
        sinCerrar: 1,
        puedeDecidir: true,
        situacion: 'disponible',
        textoAviso: null,
      } as Partial<ReturnType<typeof useRevisionAnterior>> as ReturnType<
        typeof useRevisionAnterior
      >);
    }

    it('muestra la sección con su contador junto a la lista actual', () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [nueva] }));
      simularAnterior();

      // Act
      renderEditable();

      // Assert
      expect(
        screen.getByRole('heading', { name: 'Observaciones de la revisión anterior' }),
      ).toBeInTheDocument();
      expect(screen.getByText('1 de 1 sin cerrar')).toBeInTheDocument();
      expect(screen.getByText('Ajustar el cronograma anterior')).toBeInTheDocument();
    });

    it('cerrar una observación anterior confirma con su id y la revisión anterior', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [nueva] }));
      simularAnterior();
      const mutateEstado = vi.fn();
      vi.mocked(useCambiarEstadoObservacion).mockReturnValue({
        mutate: mutateEstado,
        isPending: false,
      } as Partial<ReturnType<typeof useCambiarEstadoObservacion>> as ReturnType<
        typeof useCambiarEstadoObservacion
      >);
      const user = userEvent.setup();
      renderEditable();

      // Act
      await user.click(
        screen.getByRole('button', { name: /^Acciones de la observación: Ajustar el cronograma/ }),
      );
      await user.click(screen.getByRole('menuitem', { name: 'Cerrar observación' }));
      const dialogo = await screen.findByRole('dialog', { name: '¿Cerrar observación?' });
      await user.click(within(dialogo).getByRole('button', { name: 'Cerrar observación' }));

      // Assert
      expect(mutateEstado).toHaveBeenCalledWith(
        { observacionId: 'o-9', revisionAsesorId: 'r-0', estado: 'CERRADA' },
        expect.any(Object),
      );
    });
  });

  describe('Dar por completado', () => {
    const PRIMERA = { ...PROPS, version: { ...VERSION, version: 1 } };

    function simularAnteriorSinCerrar() {
      vi.mocked(useRevisionAnterior).mockReturnValue({
        visible: true,
        versionAnterior: { ...VERSION, id: 'v-0', version: 3, revisionAsesor: 'r-0' },
        observaciones: [{ ...solucionada, id: 'o-9', revisionAsesorId: 'r-0' }],
        isLoading: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        total: 2,
        sinCerrar: 2,
        puedeDecidir: false,
        situacion: 'disponible',
        textoAviso: null,
      } as Partial<ReturnType<typeof useRevisionAnterior>> as ReturnType<
        typeof useRevisionAnterior
      >);
    }

    it('con la primera versión sin observaciones se habilita y abre el diálogo', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [] }));
      const mutateCierre = vi.fn();
      vi.mocked(useCerrarRevision).mockReturnValue({
        mutate: mutateCierre,
        isPending: false,
      } as Partial<ReturnType<typeof useCerrarRevision>> as ReturnType<typeof useCerrarRevision>);
      const user = userEvent.setup();
      simularOmitidos(new Set(), true);
      render(<GestionarRevisionPanel {...PRIMERA} onCerrar={vi.fn()} />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Dar por completado' }));
      const dialogo = screen.getByRole('dialog', { name: '¿Dar por completado este artefacto?' });
      await user.click(within(dialogo).getByRole('button', { name: 'Dar por completado' }));

      // Assert
      expect(mutateCierre).toHaveBeenCalledWith({ revisionAsesorId: 'r-1' }, expect.any(Object));
    });

    it('con observaciones se deshabilita, la nota lo explica y Enviar revisión se habilita', () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [nueva] }));

      // Act
      renderEditable();

      // Assert
      const cerrar = screen.getByRole('button', { name: 'Dar por completado' });
      expect(cerrar).toBeDisabled();
      expect(cerrar).toHaveAccessibleDescription(
        'Para dar por completado, elimina primero las observaciones de esta revisión.',
      );
      expect(screen.getByRole('button', { name: 'Enviar revisión' })).toBeEnabled();
    });

    it('con observaciones sin cerrar en la versión anterior se deshabilita con el conteo', () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [] }));
      simularAnteriorSinCerrar();

      // Act
      renderEditable();

      // Assert
      const cerrar = screen.getByRole('button', { name: 'Dar por completado' });
      expect(cerrar).toBeDisabled();
      expect(cerrar).toHaveAccessibleDescription(
        expect.stringContaining(
          'cierra primero las observaciones de la versión anterior (2 sin cerrar)',
        ),
      );
    });

    it('en solo lectura no se ofrece', () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [] }));
      simularOmitidos(new Set(['a-1']));

      // Act
      render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

      // Assert
      expect(screen.queryByRole('button', { name: 'Dar por completado' })).not.toBeInTheDocument();
    });
  });

  describe('Eliminar revisión (HU-115)', () => {
    it('con la revisión editable se ofrece y abre la confirmación sin llamar la mutación', async () => {
      // Arrange
      const user = userEvent.setup();
      const eliminar = vi.fn();
      vi.mocked(useEliminarRevision).mockReturnValue({
        mutate: eliminar,
        isPending: false,
      } as Partial<ReturnType<typeof useEliminarRevision>> as ReturnType<
        typeof useEliminarRevision
      >);
      hook.mockReturnValue(estado({ data: [] }));
      renderEditable();

      // Act
      await user.click(screen.getByRole('button', { name: 'Eliminar revisión' }));

      // Assert
      expect(
        screen.getByRole('alertdialog', { name: '¿Eliminar esta revisión?' }),
      ).toBeInTheDocument();
      expect(eliminar).not.toHaveBeenCalled();
    });

    it('en solo lectura no se ofrece', () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [] }));
      simularOmitidos(new Set(['a-1']));

      // Act
      render(<GestionarRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

      // Assert
      expect(screen.queryByRole('button', { name: 'Eliminar revisión' })).not.toBeInTheDocument();
    });
  });
});
