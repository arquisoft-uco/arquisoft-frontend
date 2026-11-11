import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { errorApi } from '../../../../test-utils/errores-api';
import { toast } from '../../../../shared/hooks/useToast';
import { useEstudiantesVinculables } from '../../hooks/useEstudiantesVinculables';
import { useVincularEstudiantes } from '../../hooks/useVincularEstudiantes';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import VincularEstudiantesForm from './VincularEstudiantesForm';

vi.mock('../../hooks/useEstudiantesVinculables', () => ({ useEstudiantesVinculables: vi.fn() }));
vi.mock('../../hooks/useVincularEstudiantes', () => ({ useVincularEstudiantes: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const ESTUDIANTE_ID = '5b3e4c60-7d8f-4091-8cbd-2e3f4a5b6c7d';

const LUIS = {
  estudianteId: ESTUDIANTE_ID,
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
};

const ARTEFACTO: ArtefactoAsesor = {
  proyectoFinalizado: false,
  proyectoCancelado: false,
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  omitido: false,
};

const mutate = vi.fn();

function simular({ isError = false, estudiantes = [LUIS] } = {}) {
  vi.mocked(useEstudiantesVinculables).mockReturnValue({
    estudiantes,
    isLoading: false,
    isError,
    error: null,
    refetch: vi.fn(),
  });
  vi.mocked(useVincularEstudiantes).mockReturnValue({
    mutate,
    isPending: false,
    reset: vi.fn(),
  } as Partial<ReturnType<typeof useVincularEstudiantes>> as ReturnType<
    typeof useVincularEstudiantes
  >);
}

async function elegirLuis(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox', { name: /Estudiantes/ }));
  await user.click(await screen.findByRole('option', { name: /Luis Gómez/ }));
}

function montar(props: Partial<React.ComponentProps<typeof VincularEstudiantesForm>> = {}) {
  render(<VincularEstudiantesForm artefacto={ARTEFACTO} onSalir={vi.fn()} {...props} />);
}

describe('VincularEstudiantesForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simular();
  });

  it('sin elegir estudiantes el envío queda deshabilitado', () => {
    // Act
    montar();

    // Assert
    expect(
      screen.getByRole('button', { name: 'Vincular estudiantes seleccionados' }),
    ).toBeDisabled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('enviar con un estudiante elegido llama al servicio con su UUID, avisa y limpia la selección', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v, o: OpcionesMutate) => o.onSuccess());
    montar();
    await elegirLuis(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Vincular estudiantes seleccionados' }));

    // Assert
    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        { artefactoId: 'a-1', estudiantes: [ESTUDIANTE_ID] },
        expect.any(Object),
      ),
    );
    expect(toast.success).toHaveBeenCalledWith(
      'Estudiantes vinculados',
      'Se vinculó 1 estudiante a «Acta de inicio».',
    );
    await waitFor(() => expect(screen.queryByRole('button', { name: /Luis Gómez/ })).toBeNull());
  }, 15000);

  it('un 422 de ya vinculado avisa, pinta el mensaje junto al campo y mantiene la selección', async () => {
    // Arrange
    const user = userEvent.setup();
    mutate.mockImplementation((_v, o: OpcionesMutate) =>
      o.onError(
        errorApi(422, {
          status: 422,
          errorCode: 'ESTUDIANTE_ARTEFACTO_ESTUDIANTE_YA_VINCULADO',
          message: 'El estudiante ya está vinculado',
        }),
      ),
    );
    montar();
    await elegirLuis(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Vincular estudiantes seleccionados' }));

    // Assert
    expect(await screen.findByText('El estudiante ya está vinculado')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudieron vincular los estudiantes',
      'El estudiante ya está vinculado',
    );
    expect(screen.getByRole('button', { name: /Luis Gómez/ })).toBeInTheDocument();
  }, 15000);

  it('un 422 de artefacto omitido avisa y cierra el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSalir = vi.fn();
    mutate.mockImplementation((_v, o: OpcionesMutate) =>
      o.onError(
        errorApi(422, {
          status: 422,
          errorCode: 'ARTEFACTOS_ARTEFACTO_OMITIDO',
          message: 'El artefacto está omitido',
        }),
      ),
    );
    montar({ onSalir });
    await elegirLuis(user);

    // Act
    await user.click(screen.getByRole('button', { name: 'Vincular estudiantes seleccionados' }));

    // Assert
    await waitFor(() => expect(onSalir).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalled();
  }, 15000);

  it('con la consulta caída muestra el aviso en lugar del formulario', () => {
    // Arrange
    simular({ isError: true, estudiantes: [] });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Esta opción aún no está disponible.')).toBeInTheDocument();
    expect(screen.queryByRole('form', { name: 'Vincular estudiantes' })).toBeNull();
  });

  it('sin estudiantes vinculables lo indica en lugar del formulario', () => {
    // Arrange
    simular({ estudiantes: [] });

    // Act
    montar();

    // Assert
    expect(
      screen.getByText('Todos los estudiantes vigentes del proyecto ya están vinculados.'),
    ).toBeInTheDocument();
  });
});
