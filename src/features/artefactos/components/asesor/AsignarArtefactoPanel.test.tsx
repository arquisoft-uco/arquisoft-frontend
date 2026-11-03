import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useAsignarArtefacto } from '../../hooks/useAsignarArtefacto';
import { useEstudiantesProyectoCatalogo } from '../../hooks/useEstudiantesProyectoCatalogo';
import { useProyectosAsesorCatalogo } from '../../hooks/useProyectosAsesorCatalogo';
import { useVersionesRepositorioCatalogo } from '../../hooks/useVersionesRepositorioCatalogo';
import AsignarArtefactoPanel from './AsignarArtefactoPanel';

vi.mock('../../hooks/useAsignarArtefacto', () => ({ useAsignarArtefacto: vi.fn() }));
vi.mock('../../hooks/useEstudiantesProyectoCatalogo', () => ({
  useEstudiantesProyectoCatalogo: vi.fn(),
}));
vi.mock('../../hooks/useProyectosAsesorCatalogo', () => ({ useProyectosAsesorCatalogo: vi.fn() }));
vi.mock('../../hooks/useVersionesRepositorioCatalogo', () => ({
  useVersionesRepositorioCatalogo: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: (respuesta: { id: string }) => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();

const PROYECTO_ID = '3f1c2a4e-5b6d-4e7f-8a9b-0c1d2e3f4a5b';
const PROYECTO_OTRO_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
const VERSION_ID = '4a2d3b5f-6c7e-4f80-9bac-1d2e3f4a5b6c';
const ESTUDIANTE_ID = '5b3e4c60-7d8f-4091-8cbd-2e3f4a5b6c7d';

const CATALOGO_BASE = {
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

function simular({
  proyectosError = false,
  estudiantesDelProyecto = [
    {
      estudianteId: ESTUDIANTE_ID,
      identificador: '2001',
      nombre: 'Luis Gómez',
      email: 'luis@uco.edu.co',
    },
  ],
} = {}) {
  vi.mocked(useProyectosAsesorCatalogo).mockReturnValue({
    ...CATALOGO_BASE,
    isError: proyectosError,
    proyectos: [
      { id: PROYECTO_ID, titulo: 'Sistema de riego' },
      { id: PROYECTO_OTRO_ID, titulo: 'Granja solar' },
    ],
    hayMas: false,
    cargandoMas: false,
    cargarMas: vi.fn(),
  } as ReturnType<typeof useProyectosAsesorCatalogo>);
  vi.mocked(useVersionesRepositorioCatalogo).mockReturnValue({
    ...CATALOGO_BASE,
    versiones: [
      {
        id: VERSION_ID,
        nombreDocumento: 'Acta de inicio',
        numeroVersion: 2,
        fechaCreacion: '2026-01-01',
        tipoContenido: 'text/markdown',
        tamanoBytes: 10,
        nombreArchivo: 'acta.md',
        repositorioArtefacto: { id: 'r-1', nombreRepositorio: 'Repositorio base', descripcion: '' },
      },
    ],
    hayMas: false,
    cargandoMas: false,
    cargarMas: vi.fn(),
  } as ReturnType<typeof useVersionesRepositorioCatalogo>);
  vi.mocked(useEstudiantesProyectoCatalogo).mockImplementation(
    (id: string) =>
      ({
        ...CATALOGO_BASE,
        estudiantes: id ? estudiantesDelProyecto : [],
      }) as ReturnType<typeof useEstudiantesProyectoCatalogo>,
  );
  vi.mocked(useAsignarArtefacto).mockReturnValue({
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as ReturnType<typeof useAsignarArtefacto>);
}

async function elegir(
  user: ReturnType<typeof userEvent.setup>,
  campo: RegExp | string,
  opcion: RegExp,
) {
  await user.click(screen.getByRole('combobox', { name: campo }));
  await user.click(await screen.findByRole('option', { name: opcion }));
}

async function completarFormulario(user: ReturnType<typeof userEvent.setup>) {
  await elegir(user, /Proyecto de grado/, /Sistema de riego/);
  await elegir(user, /Versión del repositorio/, /Acta de inicio/);
  await elegir(user, /Estudiantes/, /Luis Gómez/);
}

describe('AsignarArtefactoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simular();
  });

  it('el selector de estudiantes está deshabilitado sin proyecto y se vacía al cambiarlo', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsignarArtefactoPanel onCerrar={vi.fn()} onAsignado={vi.fn()} />);
    const estudiantes = screen.getByRole('combobox', { name: /Estudiantes/ });
    expect(estudiantes).toBeDisabled();

    // Act
    await elegir(user, /Proyecto de grado/, /Sistema de riego/);
    await elegir(user, /Estudiantes/, /Luis Gómez/);
    expect(screen.getByRole('button', { name: /Luis Gómez/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Proyecto elegido|Quitar|Cambiar/ }));

    // Assert
    await waitFor(() => expect(screen.queryByText('Luis Gómez')).not.toBeInTheDocument());
  }, 15000);

  it('enviar sin datos muestra los errores y no llama a la mutación', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AsignarArtefactoPanel onCerrar={vi.fn()} onAsignado={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar artefacto' }));

    // Assert
    expect((await screen.findAllByText('Selecciona una opción')).length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('enviar con datos válidos llama la mutación con el body exacto, avisa y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const onAsignado = vi.fn();
    mutate.mockImplementation((_req, opciones: OpcionesMutate) =>
      opciones.onSuccess({ id: 'a-1' }),
    );
    render(<AsignarArtefactoPanel onCerrar={onCerrar} onAsignado={onAsignado} />);
    await completarFormulario(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar artefacto' }));

    // Assert
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          proyectoGrado: PROYECTO_ID,
          versionRepositorioArtefacto: VERSION_ID,
          estudiantes: [ESTUDIANTE_ID],
        },
        expect.any(Object),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Artefacto asignado',
      '«Acta de inicio v2» quedó asignado a «Sistema de riego».',
    );
    expect(onAsignado).toHaveBeenCalled();
    expect(onCerrar).toHaveBeenCalled();
  });

  it('un 422 de artefacto ya asignado avisa, marca la versión y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_req, opciones: OpcionesMutate) =>
      opciones.onError(
        errorApi(422, {
          status: 422,
          errorCode: 'ARTEFACTOS_ARTEFACTO_REPOSITORIO_YA_ASIGNADO',
          message: 'El proyecto ya tiene un artefacto activo de este repositorio',
        }),
      ),
    );
    render(<AsignarArtefactoPanel onCerrar={onCerrar} onAsignado={vi.fn()} />);
    await completarFormulario(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar artefacto' }));

    // Assert
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(
      await screen.findByText('El proyecto ya tiene un artefacto activo de este repositorio'),
    ).toBeInTheDocument();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('al reactivar no pide proyectos ni versiones, fija el destino y envía solo los estudiantes elegidos', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_req, opciones: OpcionesMutate) =>
      opciones.onSuccess({ id: 'a-1' }),
    );
    render(
      <AsignarArtefactoPanel
        onCerrar={onCerrar}
        onAsignado={vi.fn()}
        reactivar={{
          proyectoGrado: PROYECTO_ID,
          versionRepositorioArtefacto: VERSION_ID,
          nombreProyecto: 'Sistema de riego',
          nombreDocumento: 'Acta de inicio',
          versionDocumento: 2,
        }}
      />,
    );

    // Assert
    expect(vi.mocked(useProyectosAsesorCatalogo)).toHaveBeenCalledWith(false);
    expect(vi.mocked(useVersionesRepositorioCatalogo)).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('combobox', { name: /Proyecto de grado/ })).toBeNull();
    expect(screen.getByText(/Este artefacto está omitido/)).toBeInTheDocument();

    // Act
    await elegir(user, /Estudiantes/, /Luis Gómez/);
    await user.click(screen.getByRole('button', { name: 'Reactivar artefacto' }));

    // Assert
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          proyectoGrado: PROYECTO_ID,
          versionRepositorioArtefacto: VERSION_ID,
          estudiantes: [ESTUDIANTE_ID],
        },
        expect.any(Object),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Artefacto reactivado',
      '«Acta de inicio» volvió a estar activo en «Sistema de riego».',
    );
    expect(onCerrar).toHaveBeenCalled();
  }, 15000);

  it('la reactivación funciona sin onAsignado y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_req, opciones: OpcionesMutate) => {
      opciones.onSuccess({ id: 'a-1' });
    });
    render(
      <AsignarArtefactoPanel
        onCerrar={onCerrar}
        reactivar={{
          proyectoGrado: PROYECTO_ID,
          versionRepositorioArtefacto: VERSION_ID,
          nombreProyecto: 'Sistema de riego',
          nombreDocumento: 'Acta de inicio',
          versionDocumento: 2,
        }}
      />,
    );
    await elegir(user, /Estudiantes/, /Luis Gómez/);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reactivar artefacto' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  }, 15000);

  it('al reactivar, un 422 muestra el toast "No se pudo reactivar el artefacto"', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_req, opciones: OpcionesMutate) =>
      opciones.onError(errorApi(422, { status: 422, errorCode: 'OTRO', message: 'Falló' })),
    );
    render(
      <AsignarArtefactoPanel
        onCerrar={vi.fn()}
        reactivar={{
          proyectoGrado: PROYECTO_ID,
          versionRepositorioArtefacto: VERSION_ID,
          nombreProyecto: 'Sistema de riego',
          nombreDocumento: 'Acta de inicio',
          versionDocumento: 2,
        }}
      />,
    );
    await elegir(user, /Estudiantes/, /Luis Gómez/);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reactivar artefacto' }));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('No se pudo reactivar el artefacto', 'Falló'),
    );
  }, 15000);

  it('con el catálogo de proyectos caído muestra el aviso y deshabilita el envío', () => {
    // Arrange
    simular({ proyectosError: true });

    // Act
    render(<AsignarArtefactoPanel onCerrar={vi.fn()} onAsignado={vi.fn()} />);

    // Assert
    expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Asignar artefacto' })).toBeDisabled();
  });
});
