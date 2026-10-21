import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import {
  avanzar,
  restaurarTemporizadores,
  usarTemporizadoresFalsos,
} from '../../../../test-utils/temporizadores';
import AsignarJuradosEvaluacionPanel from './AsignarJuradosEvaluacionPanel';
import { useJuradosVigentes } from '../../hooks/useJuradosVigentes';
import { useAsignarJuradosEvaluacion } from '../../hooks/useAsignarJuradosEvaluacion';
import { toast } from '../../../../shared/hooks/useToast';
import type { Evaluacion } from '../../models/Evaluacion';
import type { JuradoVigente } from '../../models/JuradoVigente';

vi.mock('../../hooks/useJuradosVigentes', () => ({ useJuradosVigentes: vi.fn() }));
vi.mock('../../hooks/useAsignarJuradosEvaluacion', () => ({
  useAsignarJuradosEvaluacion: vi.fn(),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const EVALUACION: Evaluacion = {
  id: 'e-1',
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  estado: { id: 'PENDIENTE', nombre: 'Pendiente' },
};

const ID_ANA = '11111111-1111-4111-8111-111111111111';
const ANA: JuradoVigente = { id: ID_ANA, nombre: 'Ana Gómez', email: 'ana@uco.edu.co' };
const LUIS: JuradoVigente = { id: 'j-2', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' };

type ResultadoHook = ReturnType<typeof useJuradosVigentes>;

function pagina(content: JuradoVigente[], totalPages = 1) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length * totalPages,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: content.length === 0,
  };
}

function mockJurados(
  respuesta: (pagina: number, texto: string) => Partial<ResultadoHook>,
  refetch = vi.fn(),
) {
  vi.mocked(useJuradosVigentes).mockImplementation(
    (p, t) =>
      ({
        data: undefined,
        error: null,
        isLoading: false,
        isError: false,
        isFetching: false,
        refetch,
        pageSize: 10,
        ...respuesta(p, t),
      }) as ResultadoHook,
  );
  return refetch;
}

function mockMutacion(mutate = vi.fn()) {
  const mutacion: Partial<ReturnType<typeof useAsignarJuradosEvaluacion>> = {
    mutate,
    isPending: false,
  };
  vi.mocked(useAsignarJuradosEvaluacion).mockReturnValue(
    mutacion as ReturnType<typeof useAsignarJuradosEvaluacion>,
  );
  return mutate;
}

function errorApi(errorCode: string, message: string) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message, status: 422 },
    status: 422,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

describe('AsignarJuradosEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutacion();
  });

  afterEach(() => {
    restaurarTemporizadores();
  });

  it('deshabilita "Asignar jurados" mientras no haya elegidos y lo habilita al elegir uno', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    mockJurados(() => ({ data: pagina([ANA, LUIS]) }));
    render(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: 'Asignar jurados' })).toBeDisabled();
    expect(screen.getByText('Jurados elegidos (0)')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('checkbox', { name: 'Ana Gómez' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Asignar jurados' })).toBeEnabled();
    expect(screen.getByText('Jurados elegidos (1)')).toBeInTheDocument();
  });

  it('conserva la selección al cambiar de página y permite quitar un elegido', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    mockJurados((p) => ({ data: pagina(p === 0 ? [ANA] : [LUIS], 2) }));
    render(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('checkbox', { name: 'Ana Gómez' }));
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
    await user.click(screen.getByRole('checkbox', { name: 'Luis Pérez' }));

    // Assert
    expect(screen.getByText('Jurados elegidos (2)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar a Ana Gómez' })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Quitar a Ana Gómez' }));

    // Assert
    expect(screen.getByText('Jurados elegidos (1)')).toBeInTheDocument();
  });

  it('al buscar pide el texto al servidor desde la página 0 y conserva los elegidos', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    mockJurados((p) => ({ data: pagina(p === 0 ? [ANA] : [LUIS], 2) }));
    render(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);
    await user.click(screen.getByRole('checkbox', { name: 'Ana Gómez' }));
    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(useJuradosVigentes).toHaveBeenLastCalledWith(1, '');

    // Act
    await user.type(screen.getByLabelText('Buscar jurados'), 'luis');
    avanzar(300);

    // Assert
    expect(useJuradosVigentes).toHaveBeenLastCalledWith(0, 'luis');
    expect(screen.getByText('Jurados elegidos (1)')).toBeInTheDocument();
  });

  it('sin coincidencias muestra "Sin resultados" y "Limpiar búsqueda" vuelve a pedir la lista sin texto', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    mockJurados((_p, texto) => ({ data: pagina(texto ? [] : [ANA]) }));
    render(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Act
    await user.type(screen.getByLabelText('Buscar jurados'), 'zzz');
    avanzar(300);

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();

    vi.mocked(useJuradosVigentes).mockClear();

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    // Assert
    expect(vi.mocked(useJuradosVigentes).mock.calls).toContainEqual([0, '']);

    avanzar(300);

    expect(vi.mocked(useJuradosVigentes)).toHaveBeenLastCalledWith(0, '');
    expect(screen.getByRole('checkbox', { name: /Ana Gómez/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar jurados')).toHaveValue('');
  });

  it('muestra carga, vacío y error de la lista; el error permite reintentar y no bloquea el panel', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    mockJurados(() => ({ isLoading: true }));
    const { rerender } = render(
      <AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />,
    );

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando jurados…');

    // Act
    mockJurados(() => ({ data: pagina([]) }));
    rerender(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('No hay jurados vigentes')).toBeInTheDocument();

    // Act
    const refetch = mockJurados(() => ({ isError: true, error: new Error('fallo') }));
    rerender(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los jurados');
    expect(refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Asignar jurados' })).toBeDisabled();
  });

  it('al enviar asigna los ids elegidos, avisa del éxito y cierra el panel', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onCerrar = vi.fn();
    const mutate = mockMutacion(
      vi.fn((_ids: string[], opciones: { onSuccess: () => void }) => opciones.onSuccess()),
    );
    mockJurados(() => ({ data: pagina([ANA, LUIS]) }));
    render(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);
    await user.click(screen.getByRole('checkbox', { name: 'Ana Gómez' }));
    await user.click(screen.getByRole('checkbox', { name: 'Luis Pérez' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar jurados' }));

    // Assert
    expect(mutate).toHaveBeenCalledWith([ID_ANA, 'j-2'], expect.any(Object));
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('pulsar Enter en "Buscar jurados" con elegidos no envía la asignación', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const mutate = mockMutacion();
    mockJurados(() => ({ data: pagina([ANA, LUIS]) }));
    render(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={vi.fn()} />);
    await user.click(screen.getByRole('checkbox', { name: 'Ana Gómez' }));

    // Act
    await user.type(screen.getByLabelText('Buscar jurados'), 'luis{Enter}');

    // Assert
    expect(mutate).not.toHaveBeenCalled();
  });

  it('ante el 422 de jurados ya asignados muestra sus nombres, no cierra y conserva la selección', async () => {
    // Arrange
    const user = usarTemporizadoresFalsos();
    const onCerrar = vi.fn();
    mockMutacion(
      vi.fn((_ids: string[], opciones: { onError: (e: unknown) => void }) =>
        opciones.onError(
          errorApi('EVALUACION_JURADO_JURADOS_YA_ASIGNADOS', `Ya asignados: [${ID_ANA}]`),
        ),
      ),
    );
    mockJurados(() => ({ data: pagina([ANA]) }));
    render(<AsignarJuradosEvaluacionPanel evaluacion={EVALUACION} onCerrar={onCerrar} />);
    await user.click(screen.getByRole('checkbox', { name: 'Ana Gómez' }));

    // Act
    await user.click(screen.getByRole('button', { name: 'Asignar jurados' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudieron asignar los jurados',
      expect.stringContaining('Ana Gómez'),
    );
    expect(onCerrar).not.toHaveBeenCalled();
    expect(screen.getByText('Jurados elegidos (1)')).toBeInTheDocument();
  });
});
