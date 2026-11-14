import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import { useCambiarEstadoObservacionEstudiante } from '../../hooks/useCambiarEstadoObservacionEstudiante';
import { useGestionarRevisionEstudiante } from '../../hooks/useGestionarRevisionEstudiante';
import { useUltimaRevisionArtefacto } from '../../hooks/useUltimaRevisionArtefacto';
import type { VersionArtefacto } from '../../models/VersionArtefacto';
import type { ObservacionRevision } from '../../models/ObservacionRevision';
import type { RevisionGestionable } from '../../models/RevisionGestionable';
import GestionarRevisionEstudiantePanel from './GestionarRevisionEstudiantePanel';

vi.mock('../../hooks/useCambiarEstadoObservacionEstudiante', () => ({
  useCambiarEstadoObservacionEstudiante: vi.fn(),
}));
vi.mock('../../hooks/useGestionarRevisionEstudiante', () => ({
  useGestionarRevisionEstudiante: vi.fn(),
}));
vi.mock('../../hooks/useUltimaRevisionArtefacto', () => ({
  useUltimaRevisionArtefacto: vi.fn(),
}));
vi.mock('./SubirVersionArtefactoPanel', () => ({
  default: () => <div>Panel de subida</div>,
}));
vi.mock('./MarcarRevisionResueltaDialog', () => ({
  default: () => <div>Diálogo de resolución</div>,
}));

const hook = vi.mocked(useGestionarRevisionEstudiante);
const hookUltima = vi.mocked(useUltimaRevisionArtefacto);

type Resultado = ReturnType<typeof useGestionarRevisionEstudiante>;

function estado(parcial: Partial<Resultado>): Resultado {
  const base: Partial<Resultado> = {
    observaciones: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    abiertas: 0,
    editable: false,
    motivoSubida: null,
    puedeSubir: false,
    puedeResolver: false,
    notaPie: undefined,
  };
  return Object.assign(base, parcial) as Resultado;
}

const REVISION: RevisionGestionable = {
  id: 'r-1',
  artefactoId: 'a-1',
  version: 2,
  estadoId: 'EN_PROGRESO',
  estadoNombre: 'En progreso',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 3,
  fechaCreacion: '2026-03-10T15:30:00Z',
};

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

const ARTEFACTO = {
  id: 'a-1',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 3,
};

const VERSION: VersionArtefacto = {
  proyectoFinalizado: false,
  proyectoCancelado: false,
  id: 'v-2',
  artefacto: 'a-1',
  version: 2,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 3,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Laura Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
  fechaCreacionRevision: null,
};

type ResultadoUltima = ReturnType<typeof useUltimaRevisionArtefacto>;

function ultimaRevision(parcial: Partial<ResultadoUltima>): ResultadoUltima {
  const base: ResultadoUltima = {
    ultima: undefined,
    revision: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    motivoSubida: null,
    puedeSubir: true,
  };
  return { ...base, ...parcial };
}

function montarDesdeArtefacto() {
  return render(<GestionarRevisionEstudiantePanel artefacto={ARTEFACTO} onCerrar={vi.fn()} />);
}

function montar(revision = REVISION, onCerrar = vi.fn()) {
  return render(
    <GestionarRevisionEstudiantePanel
      artefacto={ARTEFACTO}
      revision={revision}
      onCerrar={onCerrar}
    />,
  );
}

describe('GestionarRevisionEstudiantePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hookUltima.mockReturnValue(ultimaRevision({ ultima: null }));
    const base: Partial<ReturnType<typeof useCambiarEstadoObservacionEstudiante>> = {
      mutate: vi.fn(),
      isPending: false,
    };
    vi.mocked(useCambiarEstadoObservacionEstudiante).mockReturnValue(
      Object.assign(base) as ReturnType<typeof useCambiarEstadoObservacionEstudiante>,
    );
  });

  it('muestra el encabezado con el documento, el proyecto y el estado de la revisión', () => {
    // Arrange
    hook.mockReturnValue(estado({ editable: true, observaciones: [nueva] }));

    // Act
    montar();

    // Assert
    expect(hook).toHaveBeenCalledWith(REVISION);
    expect(screen.getByRole('heading', { name: 'Gestionar revisión' })).toBeInTheDocument();
    expect(screen.getByText(/Sistema de riego/)).toBeInTheDocument();
    expect(screen.getByText('En progreso')).toBeInTheDocument();
  });

  it('muestra el estado de carga accesible mientras consulta', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    montar();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista una tarjeta por observación con su descripción y el nombre de su estado', () => {
    // Arrange
    hook.mockReturnValue(estado({ observaciones: [nueva, solucionada] }));

    // Act
    montar();

    // Assert
    const lista = screen.getByRole('list', { name: 'Observaciones de la revisión' });
    const items = within(lista).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Falta el diagrama de despliegue')).toBeInTheDocument();
    expect(within(items[1]).getByText('Solucionada')).toBeInTheDocument();
  });

  it('muestra el vacío con el texto del estudiante y no un error', () => {
    // Arrange
    hook.mockReturnValue(estado({ observaciones: [] }));

    // Act
    montar();

    // Assert
    expect(screen.getByText('Esta revisión aún no tiene observaciones')).toBeInTheDocument();
    expect(
      screen.getByText('Tu asesor aún no ha registrado observaciones en esta revisión.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error y reintenta la consulta al pulsar Reintentar', async () => {
    // Arrange
    const refetch = vi.fn();
    hook.mockReturnValue(estado({ isError: true, error: new Error('Sin conexión'), refetch }));
    const user = userEvent.setup();

    // Act
    montar();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No pudimos cargar las observaciones')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('llama a onCerrar al pulsar Cerrar', async () => {
    // Arrange
    const onCerrar = vi.fn();
    hook.mockReturnValue(estado({ observaciones: [] }));
    const user = userEvent.setup();

    // Act
    montar(REVISION, onCerrar);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  });

  it('editable muestra casilla solo en las observaciones avanzables', () => {
    // Arrange
    const cerrada: ObservacionRevision = {
      ...nueva,
      id: 'o-3',
      descripcion: 'Ajustar el glosario',
      estadoId: 'CERRADA',
      estadoNombre: 'Cerrada',
    };
    hook.mockReturnValue(
      estado({ editable: true, observaciones: [nueva, solucionada, cerrada], abiertas: 1 }),
    );

    // Act
    montar();

    // Assert
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(
      screen.getByRole('checkbox', { name: 'Solucionada: Corregir la portada' }),
    ).toBeChecked();
  });

  it('con la revisión resuelta queda en solo lectura: sin casillas ni acciones', () => {
    // Arrange
    hook.mockReturnValue(
      estado({
        editable: false,
        observaciones: [nueva],
        notaPie: 'Esta revisión ya no admite cambios.',
      }),
    );

    // Act
    montar({ ...REVISION, estadoId: 'RESUELTA', estadoNombre: 'Resuelta' });

    // Assert
    expect(screen.getByRole('heading', { name: 'Ver revisión' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Marcar como resuelta' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Subir nueva versión' })).not.toBeInTheDocument();
    expect(screen.getByText('Esta revisión ya no admite cambios.')).toBeInTheDocument();
  });

  it('deshabilita Marcar como resuelta con observaciones abiertas y la nota del pie lo explica', () => {
    // Arrange
    hook.mockReturnValue(
      estado({
        editable: true,
        observaciones: [nueva],
        abiertas: 1,
        puedeResolver: false,
        notaPie: 'Te falta marcar 1 observación como solucionada.',
      }),
    );

    // Act
    montar();

    // Assert
    expect(screen.getByRole('button', { name: 'Marcar como resuelta' })).toBeDisabled();
    expect(screen.getByText('Te falta marcar 1 observación como solucionada.')).toBeInTheDocument();
  });

  it('muestra el motivo bajo Subir nueva versión cuando está bloqueada', () => {
    // Arrange
    hook.mockReturnValue(
      estado({
        editable: true,
        observaciones: [],
        puedeSubir: false,
        motivoSubida: 'Esperando la revisión del asesor.',
      }),
    );

    // Act
    montar();

    // Assert
    expect(screen.getByRole('button', { name: 'Subir nueva versión' })).toBeDisabled();
    expect(screen.getByText('Esperando la revisión del asesor.')).toBeInTheDocument();
  });

  it('abre el panel de subida y el diálogo de resolución desde el pie', async () => {
    // Arrange
    hook.mockReturnValue(
      estado({
        editable: true,
        observaciones: [solucionada],
        puedeSubir: true,
        puedeResolver: true,
      }),
    );
    const user = userEvent.setup();
    montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Subir nueva versión' }));

    // Assert
    expect(screen.getByText('Panel de subida')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Marcar como resuelta' }));

    // Assert
    expect(screen.getByText('Diálogo de resolución')).toBeInTheDocument();
  });

  describe('desde un artefacto, sin revisión explícita', () => {
    it('sin versiones avisa y deja subir la primera', async () => {
      // Arrange
      hookUltima.mockReturnValue(ultimaRevision({ ultima: null }));
      const user = userEvent.setup();

      // Act
      montarDesdeArtefacto();

      // Assert
      expect(screen.getByText('Aún no has subido versiones')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Marcar como resuelta' }),
      ).not.toBeInTheDocument();

      // Act
      await user.click(screen.getByRole('button', { name: 'Subir nueva versión' }));

      // Assert
      expect(screen.getByText('Panel de subida')).toBeInTheDocument();
    });

    it('con la última versión sin revisión avisa y deshabilita subir con su motivo', () => {
      // Arrange
      hookUltima.mockReturnValue(
        ultimaRevision({
          ultima: VERSION,
          puedeSubir: false,
          motivoSubida: 'Esperando la revisión del asesor.',
        }),
      );

      // Act
      montarDesdeArtefacto();

      // Assert
      expect(screen.getByText('Aún no tiene revisión')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Subir nueva versión' })).toBeDisabled();
      expect(screen.getByText('Esperando la revisión del asesor.')).toBeInTheDocument();
    });

    it('muestra la carga y, si falla, reintenta la consulta de la última versión', async () => {
      // Arrange
      const refetch = vi.fn();
      hookUltima.mockReturnValue(ultimaRevision({ ultima: undefined, isLoading: true }));
      const { unmount } = montarDesdeArtefacto();

      // Assert
      expect(screen.getByRole('status')).toBeInTheDocument();
      unmount();

      // Arrange
      hookUltima.mockReturnValue(ultimaRevision({ isError: true, refetch }));
      const user = userEvent.setup();

      // Act
      montarDesdeArtefacto();
      await user.click(screen.getByRole('button', { name: 'Reintentar' }));

      // Assert
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('con la revisión en progreso de la última versión muestra las casillas', () => {
      // Arrange
      hookUltima.mockReturnValue(ultimaRevision({ ultima: VERSION, revision: REVISION }));
      hook.mockReturnValue(estado({ editable: true, observaciones: [nueva], puedeSubir: true }));

      // Act
      montarDesdeArtefacto();

      // Assert
      expect(hook).toHaveBeenCalledWith(REVISION);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Marcar como resuelta' })).toBeInTheDocument();
    });

    it('con la revisión cerrada queda en solo lectura con la nota del estado', () => {
      // Arrange
      const cerrada = { ...REVISION, estadoId: 'CERRADA', estadoNombre: 'Cerrada' };
      hookUltima.mockReturnValue(ultimaRevision({ ultima: VERSION, revision: cerrada }));
      hook.mockReturnValue(
        estado({
          editable: false,
          observaciones: [nueva],
          notaPie:
            'El asesor dio por completado este artefacto, por eso no admite nuevas versiones.',
        }),
      );

      // Act
      montarDesdeArtefacto();

      // Assert
      expect(screen.getByRole('heading', { name: 'Ver revisión' })).toBeInTheDocument();
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.getByText(/por eso no admite nuevas versiones/)).toBeInTheDocument();
    });
  });
});
