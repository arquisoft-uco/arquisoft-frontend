import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../test-utils/render';
import EstadosFichaPanel from './EstadosFichaPanel';
import { useEstadosFicha } from '../hooks/useEstadosFicha';
import { useAgregarEstadoFichaPerfil } from '../hooks/useAgregarEstadoFichaPerfil';
import { useEvaluacionesFichaAsesor } from '../hooks/useEvaluacionesFichaAsesor';
import { toast } from '../../../shared/hooks/useToast';
import type { ApiError } from '../../../shared/models/api-response';
import type { EstadoFicha } from '../models/fichas-perfil';

vi.mock('../hooks/useEstadosFicha', () => ({
  useEstadosFicha: vi.fn(),
}));

vi.mock('../hooks/useEvaluacionesFichaAsesor', () => ({
  useEvaluacionesFichaAsesor: vi.fn(),
}));

vi.mock('../hooks/useAgregarEstadoFichaPerfil', () => ({
  useAgregarEstadoFichaPerfil: vi.fn(),
}));

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

type Mutacion = ReturnType<typeof useAgregarEstadoFichaPerfil>;
type OpcionesMutate = { onSuccess?: () => void; onError?: (err: unknown) => void };

function simularEstados(parcial: Partial<ReturnType<typeof useEstadosFicha>> = {}) {
  vi.mocked(useEstadosFicha).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useEstadosFicha>);
}

function simularEvaluaciones(estados: string[] | 'cargando' | 'error') {
  const resultado =
    estados === 'cargando'
      ? { data: undefined, isLoading: true, isError: false }
      : estados === 'error'
        ? { data: undefined, isLoading: false, isError: true }
        : {
            data: estados.map((id) => ({ estadoEvaluacionId: id })),
            isLoading: false,
            isError: false,
          };
  vi.mocked(useEvaluacionesFichaAsesor).mockReturnValue(resultado as never);
}

function simularMutacion(mutate: (id: string, opciones: OpcionesMutate) => void = vi.fn()) {
  vi.mocked(useAgregarEstadoFichaPerfil).mockReturnValue({
    mutate,
    isPending: false,
  } as Mutacion);
  return mutate;
}

function crearErrorApi(cuerpo: ApiError) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: cuerpo.status,
    statusText: 'Unprocessable Entity',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const ESTADOS: EstadoFicha[] = [
  { id: 'EN_CONSTRUCCION', nombre: 'En Construccion', descripcion: 'desc' },
  { id: 'DISPONIBLE_PARA_EVALUACION', nombre: 'Disponible Para Evaluacion', descripcion: 'desc' },
  { id: 'DESCARTADA', nombre: 'Descartada', descripcion: 'desc' },
];

const EN_CONSTRUCCION = { id: 'EN_CONSTRUCCION', nombre: 'En Construccion' };
const DISPONIBLE = { id: 'DISPONIBLE_PARA_EVALUACION', nombre: 'Disponible Para Evaluacion' };

function renderizar(estadoActual = EN_CONSTRUCCION) {
  return render(<EstadosFichaPanel fichaPerfilId="f-1" estadoActual={estadoActual} />);
}

async function elegirYEnviar(user: ReturnType<typeof userEvent.setup>, estadoId: string) {
  await user.selectOptions(screen.getByLabelText('Nuevo estado'), estadoId);
  await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));
}

describe('EstadosFichaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    simularEstados({ data: ESTADOS });
    simularMutacion();
    simularEvaluaciones([]);
  });

  it('mientras carga el catálogo muestra el estado de carga accesible y el estado actual', () => {
    // Arrange
    simularEstados({ isLoading: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando estados…');
    expect(screen.getByText('Estado actual:')).toBeInTheDocument();
  });

  it('si el catálogo falla muestra el aviso y no ofrece el formulario', () => {
    // Arrange
    simularEstados({ isError: true });

    // Act
    renderizar();

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los estados');
    expect(screen.queryByLabelText('Nuevo estado')).not.toBeInTheDocument();
  });

  it('ofrece solo los destinos permitidos desde el estado actual', () => {
    // Act
    renderizar({ id: 'DESCARTADA', nombre: 'Descartada' });

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Selecciona un estado...',
      'En Construccion',
    ]);
  });

  it('en un estado final avisa y no muestra el formulario', () => {
    // Act
    renderizar({ id: 'APROBADA', nombre: 'Aprobada' });

    // Assert
    expect(screen.getByText(/estado final/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nuevo estado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
  });

  it('con la ficha en otro estado no consulta las evaluaciones', () => {
    // Act
    renderizar();

    // Assert
    expect(useEvaluacionesFichaAsesor).toHaveBeenCalledWith('f-1', false);
    expect(screen.getByLabelText('Nuevo estado')).toBeInTheDocument();
  });

  it('con la ficha disponible y evaluaciones en curso avisa y no ofrece el formulario', () => {
    // Arrange
    simularEvaluaciones(['EN_EVALUACION', 'APROBADA']);

    // Act
    renderizar(DISPONIBLE);

    // Assert
    expect(useEvaluacionesFichaAsesor).toHaveBeenCalledWith('f-1', true);
    expect(screen.getByText(/tiene 1 evaluación en curso/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nuevo estado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cambiar estado' })).not.toBeInTheDocument();
  });

  it('con la ficha disponible y una evaluación finalizada avisa que espera la decisión del coordinador', () => {
    // Arrange
    simularEvaluaciones(['NO_APROBADA']);

    // Act
    renderizar(DISPONIBLE);

    // Assert
    expect(screen.getByText(/espera la decisión del coordinador/)).toBeInTheDocument();
    expect(screen.queryByLabelText('Nuevo estado')).not.toBeInTheDocument();
  });

  it('con evaluaciones solo descartadas o sin evaluaciones ofrece el formulario', () => {
    // Arrange
    simularEvaluaciones(['DESCARTADA']);

    // Act
    const descartadas = renderizar(DISPONIBLE);

    // Assert
    expect(screen.getByLabelText('Nuevo estado')).toBeInTheDocument();
    descartadas.unmount();

    // Arrange
    simularEvaluaciones([]);

    // Act
    renderizar(DISPONIBLE);

    // Assert
    expect(screen.getByLabelText('Nuevo estado')).toBeInTheDocument();
  });

  it('mientras cargan las evaluaciones muestra el esqueleto y si fallan el formulario con una advertencia', () => {
    // Arrange
    simularEvaluaciones('cargando');
    const cargando = renderizar(DISPONIBLE);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Revisando las evaluaciones…');
    expect(screen.queryByLabelText('Nuevo estado')).not.toBeInTheDocument();
    cargando.unmount();

    // Arrange
    simularEvaluaciones('error');

    // Act
    renderizar(DISPONIBLE);

    // Assert
    expect(screen.getByLabelText('Nuevo estado')).toBeInTheDocument();
    expect(screen.getByText(/No pudimos revisar las evaluaciones/)).toBeInTheDocument();
  });

  it('sin elegir estado no abre la confirmación, no envía y pinta el error del campo', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simularMutacion();
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(await screen.findAllByRole('alert')).not.toHaveLength(0);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('al confirmar envía el estado elegido y avisa con un toast de éxito', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = simularMutacion(
      vi.fn((_id, opciones: OpcionesMutate) => opciones.onSuccess?.()),
    );
    renderizar();

    // Act
    await elegirYEnviar(user, 'DESCARTADA');
    const dialogo = await screen.findByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    await waitFor(() => expect(mutate).toHaveBeenCalledWith('DESCARTADA', expect.any(Object)));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('ante un 422 muestra el mensaje del backend en un toast, conserva la selección y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    const error = crearErrorApi({
      error: 'Unprocessable Entity',
      errorCode: 'ESTADO_FICHA_PERFIL_EVALUACION_EN_CURSO',
      message: 'Hay evaluaciones en curso',
      status: 422,
    });
    simularMutacion((_id, opciones) => opciones.onError?.(error));
    renderizar();

    // Act
    await elegirYEnviar(user, 'DESCARTADA');
    const dialogo = await screen.findByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo cambiar el estado',
        'Hay evaluaciones en curso',
      ),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Nuevo estado')).toHaveValue('DESCARTADA');
  });

  it('un 422 de campo estadoFicha se pinta en el campo además del toast', async () => {
    // Arrange
    const user = userEvent.setup();
    const error = crearErrorApi({
      error: 'Unprocessable Entity',
      message: 'Estado no asignable',
      status: 422,
      fieldErrors: [{ field: 'estadoFicha', message: 'El asesor no puede asignar este estado' }],
    });
    simularMutacion((_id, opciones) => opciones.onError?.(error));
    renderizar();

    // Act
    await elegirYEnviar(user, 'DESCARTADA');
    const dialogo = await screen.findByRole('dialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Cambiar estado' }));

    // Assert
    expect(await screen.findByText('El asesor no puede asignar este estado')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
