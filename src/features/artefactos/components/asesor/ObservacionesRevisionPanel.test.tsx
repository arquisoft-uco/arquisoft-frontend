import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import { useObservacionesRevision } from '../../hooks/useObservacionesRevision';
import { usePuedeGestionarObservaciones } from '../../hooks/usePuedeGestionarObservaciones';
import { useRegistrarObservacion } from '../../hooks/useRegistrarObservacion';
import { useEliminarObservacion } from '../../hooks/useEliminarObservacion';
import { useUltimaVersionArtefacto } from '../../hooks/useUltimaVersionArtefacto';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import ObservacionesRevisionPanel from './ObservacionesRevisionPanel';

vi.mock('../../hooks/useObservacionesRevision', () => ({
  useObservacionesRevision: vi.fn(),
}));

vi.mock('../../hooks/usePuedeGestionarObservaciones', () => ({
  usePuedeGestionarObservaciones: vi.fn(),
}));
vi.mock('../../hooks/useRegistrarObservacion', () => ({ useRegistrarObservacion: vi.fn() }));
vi.mock('../../hooks/useEliminarObservacion', () => ({ useEliminarObservacion: vi.fn() }));
vi.mock('../../hooks/useUltimaVersionArtefacto', () => ({
  useUltimaVersionArtefacto: vi.fn(() => ({
    ultimaVersion: undefined,
    isLoading: false,
    isError: false,
  })),
}));
vi.mock('../../hooks/useCambiarEstadoObservacion', () => ({
  useCambiarEstadoObservacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('../../hooks/useEnviarRevision', () => ({
  useEnviarRevision: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const hook = vi.mocked(useObservacionesRevision);

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
};

const PROPS = { revisionAsesorId: 'r-1', version: VERSION, editable: false };

function simularOmitidos(omitidos: Set<string> | undefined) {
  vi.mocked(usePuedeGestionarObservaciones).mockReturnValue({
    puedeGestionar: vi.fn(),
    omitidos,
  });
}

describe('ObservacionesRevisionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularOmitidos(new Set());
    vi.mocked(useRegistrarObservacion).mockReturnValue({
      mutate: vi.fn(),
      reset: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useRegistrarObservacion>> as ReturnType<
      typeof useRegistrarObservacion
    >);
    vi.mocked(useEliminarObservacion).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as Partial<ReturnType<typeof useEliminarObservacion>> as ReturnType<
      typeof useEliminarObservacion
    >);
  });

  it('muestra el estado de carga accesible mientras consulta', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(hook).toHaveBeenCalledWith('r-1');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista una tarjeta por observación con su descripción y el nombre de su estado', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));

    // Act
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

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
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

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
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={vi.fn()} />);
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
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={onCerrar} />);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  });

  it('editable muestra Agregar observación y un Eliminar por tarjeta, sin aviso', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva, solucionada] }));

    // Act
    render(<ObservacionesRevisionPanel {...PROPS} editable onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Agregar observación' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Eliminar observación:/ })).toHaveLength(2);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('editable ofrece Enviar revisión y abre su confirmación; no editable no la ofrece', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    const user = userEvent.setup();
    const { unmount } = render(
      <ObservacionesRevisionPanel {...PROPS} editable onCerrar={vi.fn()} />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Enviar revisión' }));

    // Assert
    expect(screen.getByRole('dialog', { name: '¿Enviar revisión?' })).toBeInTheDocument();

    // Act
    unmount();
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Enviar revisión' })).not.toBeInTheDocument();
  });

  it('editable con la lista vacía invita a agregar la primera y deja la acción visible', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    render(<ObservacionesRevisionPanel {...PROPS} editable onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Agrega la primera observación de esta revisión.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar observación' })).toBeInTheDocument();
  });

  it('con una revisión que ya no está pendiente explica que es de solo lectura y no ofrece cambios', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    const version = { ...VERSION, estadoRevision: 'EN_PROGRESO' };

    // Act
    render(<ObservacionesRevisionPanel {...PROPS} version={version} onCerrar={vi.fn()} />);

    // Assert
    expect(
      screen.getByText(/ya no está pendiente: sus observaciones no se pueden cambiar/),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar observación' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /^Eliminar observación:/ }),
    ).not.toBeInTheDocument();
  });

  it('con un artefacto omitido explica el motivo y no ofrece cambios', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    simularOmitidos(new Set(['a-1']));

    // Act
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

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
    render(<ObservacionesRevisionPanel {...PROPS} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar observación' })).not.toBeInTheDocument();
  });

  it('Agregar observación abre el formulario y Eliminar abre la confirmación', async () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [nueva] }));
    const user = userEvent.setup();
    render(<ObservacionesRevisionPanel {...PROPS} editable onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: /^Eliminar observación:/ }));

    // Assert
    expect(screen.getByRole('alertdialog', { name: '¿Eliminar observación?' })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
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
      });
    }

    it('solo la observación solucionada tiene menú y reabrir se habilita con la versión siguiente pendiente', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [nueva, solucionada] }));
      simularUltima({ ...SIGUIENTE, estadoRevision: 'PENDIENTE' });
      const user = userEvent.setup();
      render(<ObservacionesRevisionPanel {...PROPS} version={RESUELTA} onCerrar={vi.fn()} />);

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

    it('con la revisión de la versión siguiente ya enviada deshabilita reabrir y explica el motivo', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [solucionada] }));
      simularUltima({ ...SIGUIENTE, estadoRevision: 'EN_PROGRESO' });
      const user = userEvent.setup();
      render(<ObservacionesRevisionPanel {...PROPS} version={RESUELTA} onCerrar={vi.fn()} />);

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
      render(<ObservacionesRevisionPanel {...PROPS} version={RESUELTA} onCerrar={vi.fn()} />);

      // Assert
      expect(
        screen.queryByRole('button', { name: /^Acciones de la observación:/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Este artefacto está omitido y no admite cambios.'),
      ).toBeInTheDocument();
    });
  });
});
