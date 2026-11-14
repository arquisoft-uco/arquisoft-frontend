import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { toast } from '../../../../shared/hooks/useToast';
import { LIMITES, MENSAJES_VALIDACION } from '../../../../shared/validation';
import { useAsesoresProyecto } from '../../hooks/useAsesoresProyecto';
import { useMapaRutaEstudiante } from '../../hooks/useMapaRutaEstudiante';
import { useModificarInformacionTarea } from '../../hooks/useModificarInformacionTarea';
import type { Tarea } from '../../models/Tarea';
import ModificarInformacionTareaPanel from './ModificarInformacionTareaPanel';

vi.mock('../../hooks/useModificarInformacionTarea', () => ({
  useModificarInformacionTarea: vi.fn(),
}));
vi.mock('../../hooks/useAsesoresProyecto', () => ({ useAsesoresProyecto: vi.fn() }));
vi.mock('../../hooks/useMapaRutaEstudiante', () => ({ useMapaRutaEstudiante: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));

interface OpcionesMutate {
  onSuccess: () => void;
  onError: (err: unknown) => void;
}

const mutate = vi.fn();
const refetchAsesores = vi.fn();

const TAREA: Tarea = {
  id: 't-1',
  descripcion: 'Entregar informe',
  mapaRutaId: 'm-1',
  fechaInicioMapaRuta: '2026-03-05',
  fechaFinMapaRuta: '2026-08-01',
  estado: { id: 'NUEVA', nombre: 'Nueva' },
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
};

const MAPA = {
  id: 'm-1',
  proyectoGradoId: 'p-1',
  titulo: 'Mapa',
  fechaInicio: '2026-03-05',
  fechaFin: '2026-08-01',
};

const ASESORES = [
  { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co', estadoId: 'ASIGNADO', actual: true },
  { id: 'a-2', nombre: 'Luis Mora', email: 'luis@uco.edu.co', estadoId: 'ASIGNADO', actual: true },
];

function simularAsesores(parcial: Partial<ReturnType<typeof useAsesoresProyecto>> = {}) {
  vi.mocked(useAsesoresProyecto).mockReturnValue({
    data: ASESORES,
    isLoading: false,
    isError: false,
    refetch: refetchAsesores,
    ...parcial,
  } as ReturnType<typeof useAsesoresProyecto>);
}

function errorApi(errorCode: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Unprocessable Entity', errorCode, message: 'crudo', status: 422 },
    status: 422,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

async function editarDescripcion(user: ReturnType<typeof userEvent.setup>, texto: string) {
  const campo = screen.getByRole('textbox', { name: /Descripción/ });
  await user.clear(campo);
  if (texto) await user.type(campo, texto);
  return campo;
}

describe('ModificarInformacionTareaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModificarInformacionTarea).mockReturnValue({
      mutate,
      mutateAsync: vi.fn(),
      reset: vi.fn(),
      data: undefined,
      error: null,
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      submittedAt: 0,
      isError: false,
      isIdle: true,
      isPaused: false,
      isPending: false,
      isSuccess: false,
      status: 'idle',
    });
    vi.mocked(useMapaRutaEstudiante).mockReturnValue({
      mapa: MAPA,
      cargando: false,
      sinMapa: false,
      hayError: false,
      reintentar: vi.fn(),
    });
    simularAsesores();
  });

  it('arranca con la descripción y el asesor de la tarea y no ofrece guardar sin cambios', () => {
    // Arrange / Act
    render(<ModificarInformacionTareaPanel tarea={TAREA} onCerrar={vi.fn()} />);

    // Assert
    const campo = screen.getByRole('textbox', { name: /Descripción/ });
    expect(campo).toHaveValue('Entregar informe');
    expect(campo).toHaveAttribute('maxlength', String(LIMITES.TAREA_DESCRIPCION_MAX));
    expect(screen.getByRole('radio', { name: /Ana Ruiz/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Luis Mora/ })).not.toBeChecked();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
  });

  it('con descripción vacía muestra el mensaje de requerido y no envía', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<ModificarInformacionTareaPanel tarea={TAREA} onCerrar={vi.fn()} />);

    // Act
    await editarDescripcion(user, '');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect((await screen.findAllByText(MENSAJES_VALIDACION.requerido)).length).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al enviar llama a la mutación, muestra el toast de éxito y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) => o.onSuccess());
    render(<ModificarInformacionTareaPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await editarDescripcion(user, 'Entregar informe final');
    await user.click(screen.getByRole('radio', { name: /Luis Mora/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { tareaId: 't-1', req: { descripcion: 'Entregar informe final', asesorId: 'a-2' } },
      expect.any(Object),
    );
    expect(toast.success).toHaveBeenCalledWith('Tarea actualizada', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con TAREA_DUPLICADA pinta el error bajo Descripción, avisa con toast y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('TAREA_DUPLICADA')),
    );
    render(<ModificarInformacionTareaPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await editarDescripcion(user, 'Otra tarea');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo actualizar la tarea',
      expect.stringContaining('Ya hay una tarea con esa descripción'),
    );
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveAccessibleDescription(
      /Ya hay una tarea con esa descripción/,
    );
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveValue('Otra tarea');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con ASESOR_NO_ASIGNADO_PROYECTO_GRADO pinta el error bajo Asesor y deja el panel abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('ASESOR_NO_ASIGNADO_PROYECTO_GRADO')),
    );
    render(<ModificarInformacionTareaPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('radio', { name: /Luis Mora/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('radiogroup', { name: 'Asesor' })).toHaveAccessibleDescription(
      /no está asignado a tu proyecto/,
    );
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('con TAREA_NO_ENCONTRADA avisa con toast y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mutate.mockImplementation((_v: unknown, o: OpcionesMutate) =>
      o.onError(errorApi('TAREA_NO_ENCONTRADA')),
    );
    render(<ModificarInformacionTareaPanel tarea={TAREA} onCerrar={onCerrar} />);

    // Act
    await editarDescripcion(user, 'Otra');
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    expect(toast.error).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con error de asesores muestra el aviso, Reintentar recarga y la descripción sigue editable', async () => {
    // Arrange
    simularAsesores({ data: undefined, isError: true });
    const user = userEvent.setup();
    render(<ModificarInformacionTareaPanel tarea={TAREA} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));
    await editarDescripcion(user, 'Nueva');

    // Assert
    expect(screen.getByText('No pudimos cargar los asesores de tu proyecto')).toBeInTheDocument();
    expect(refetchAsesores).toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Descripción/ })).toHaveValue('Nueva');
  });
});
