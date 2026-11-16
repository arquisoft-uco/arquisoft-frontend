import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { cleanup, render, screen } from '../../../test-utils/render';
import ConsultarEvaluacionesCuantitativasRealizadasJurado from './ConsultarEvaluacionesCuantitativasRealizadasJurado';
import type { ConsultaCuantitativas } from './ConsultarEvaluacionesCuantitativasRealizadasJurado';
import {
  EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA,
  EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO,
} from '../utils/codigos-error-evaluaciones';
import type { EvaluacionCuantitativaJurado } from '../models/EvaluacionCuantitativaJurado';
import type { ObservacionItemJurado } from '../models/ObservacionItemJurado';

const OBSERVACION: ObservacionItemJurado = { id: 'obs-1', descripcion: 'Falta profundidad' };

const FILA: EvaluacionCuantitativaJurado = {
  id: 'ec-1',
  puntaje: 40,
  item: {
    id: 'i-1',
    nombre: 'Claridad',
    descripcion: 'Qué tan claro es el documento',
    categoriaId: 'c-1',
    valor: 50,
  },
};

const OTRA_FILA: EvaluacionCuantitativaJurado = {
  ...FILA,
  id: 'ec-2',
  puntaje: 10,
  item: { ...FILA.item, id: 'i-2', nombre: 'Rigor' },
};

vi.mock('./jurado/ObservacionesEvaluacionCuantitativaPanel', () => ({
  default: ({
    evaluacion,
    puedeModificar,
    puedeRemover,
    onModificar,
    onCerrar,
  }: {
    evaluacion: EvaluacionCuantitativaJurado;
    puedeModificar?: boolean;
    puedeRemover?: boolean;
    onModificar?: (observacion: ObservacionItemJurado) => void;
    onCerrar: () => void;
  }) => (
    <div role="dialog" aria-label={`Panel de ${evaluacion.item.nombre}`}>
      {puedeModificar && (
        <button type="button" onClick={() => onModificar?.(OBSERVACION)}>
          Modificar observación
        </button>
      )}
      {puedeRemover && <button type="button">Remover observación</button>}
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

vi.mock('./jurado/ModificarObservacionItemJuradoPanel', () => ({
  default: ({
    observacion,
    nombreItem,
    onCerrar,
  }: {
    observacion: ObservacionItemJurado;
    nombreItem: string;
    onCerrar: () => void;
  }) => (
    <div role="dialog" aria-label={`Edición de ${nombreItem}`}>
      <p>{observacion.descripcion}</p>
      <button type="button" onClick={onCerrar}>
        Cancelar edición
      </button>
    </div>
  ),
}));

vi.mock('./jurado/CambiarPuntajeEvaluacionCuantitativaJuradoPanel', () => ({
  default: ({ fila, onCerrar }: { fila: EvaluacionCuantitativaJurado; onCerrar: () => void }) => (
    <div role="dialog" aria-label={`Cambio de puntaje de ${fila.item.nombre}`}>
      <button type="button" onClick={onCerrar}>
        Cerrar cambio
      </button>
    </div>
  ),
}));

function crearError(status: number, errorCode?: string, message = 'Falla del servidor') {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { status, errorCode, message },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

function montar(
  parcial: Partial<ConsultaCuantitativas> = {},
  conEvaluar = false,
  evaluacionFinalizada = false,
) {
  const refetch = vi.fn();
  const onVolver = vi.fn();
  const onEvaluar = vi.fn();
  const consulta: ConsultaCuantitativas = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch,
    ...parcial,
  };
  render(
    <ConsultarEvaluacionesCuantitativasRealizadasJurado
      consulta={consulta}
      etiquetaVolver="Volver a mis evaluaciones"
      onVolver={onVolver}
      onEvaluar={conEvaluar ? onEvaluar : undefined}
      evaluacionJuradoId="ej-1"
      evaluacionFinalizada={evaluacionFinalizada}
    />,
  );
  return { refetch, onVolver, onEvaluar };
}

describe('ConsultarEvaluacionesCuantitativasRealizadasJurado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista ítem y puntaje de valor máximo y anuncia el total en singular y plural', () => {
    // Arrange / Act
    montar({ data: [FILA] });

    // Assert
    expect(screen.getByText('1 evaluación cuantitativa')).toBeInTheDocument();
    expect(screen.getAllByText('Claridad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('40 de 50').length).toBeGreaterThan(0);

    // Act
    cleanup();
    montar({ data: [FILA, OTRA_FILA] });

    // Assert
    expect(screen.getByText('2 evaluaciones cuantitativas')).toBeInTheDocument();
  });

  it('«Ver observaciones» abre el panel del ítem de la fila y «Cerrar panel» lo cierra', async () => {
    // Arrange
    montar({ data: [FILA, OTRA_FILA] });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Ver observaciones de Rigor' })[0]);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de Rigor' })).toBeInTheDocument();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el estado de carga', () => {
    // Arrange / Act
    montar({ isLoading: true });

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con lista vacía ofrece «Evaluar cuantitativas» solo si hay onEvaluar', async () => {
    // Arrange
    montar({ data: [] });

    // Assert
    expect(screen.getByText('Aún no registraste evaluaciones cuantitativas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Evaluar cuantitativas' })).not.toBeInTheDocument();

    // Arrange
    cleanup();
    const { onEvaluar } = montar({ data: [] }, true);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Evaluar cuantitativas' }));

    // Assert
    expect(onEvaluar).toHaveBeenCalledTimes(1);
  });

  it('el 422 de evaluación inexistente muestra su error sin reintento y permite volver', async () => {
    // Arrange
    const { onVolver } = montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_JURADO_EVALUACION_JURADO_NO_ENCONTRADA),
    });

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Volver a mis evaluaciones' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Esta evaluación no está disponible');
    expect(onVolver).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('el 422 de otro jurado muestra su propio mensaje sin reintento', () => {
    // Arrange / Act
    montar({
      isError: true,
      error: crearError(422, EVALUACION_CUALITATIVA_JURADO_NO_PERTENECE_JURADO),
    });

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No puedes consultar esta evaluación');
    expect(screen.queryByRole('button', { name: /Reintentar/ })).not.toBeInTheDocument();
  });

  it('otro error muestra el mensaje del backend y reintenta con refetch', async () => {
    // Arrange
    const { refetch } = montar({ isError: true, error: crearError(400, 'X', 'Id inválido') });

    // Act
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('Id inválido');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('«Modificar observación» abre la edición de la observación y cancelar vuelve a la lectura', async () => {
    // Arrange
    const user = userEvent.setup();
    montar({ data: [FILA] });
    await user.click(screen.getAllByRole('button', { name: 'Ver observaciones de Claridad' })[0]);

    // Act
    await user.click(screen.getByRole('button', { name: 'Modificar observación' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Edición de Claridad' })).toBeInTheDocument();
    expect(screen.getByText(OBSERVACION.descripcion)).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cancelar edición' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de Claridad' })).toBeInTheDocument();
  });

  it('con la evaluación finalizada la lectura no ofrece «Modificar observación»', async () => {
    // Arrange
    const user = userEvent.setup();
    montar({ data: [FILA] }, false, true);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Ver observaciones de Claridad' })[0]);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de Claridad' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Modificar observación' })).not.toBeInTheDocument();
  });

  it('solo ofrece «Remover observación» mientras la evaluación no está finalizada', async () => {
    // Arrange
    const user = userEvent.setup();
    montar({ data: [FILA] });
    await user.click(screen.getAllByRole('button', { name: 'Ver observaciones de Claridad' })[0]);
    expect(screen.getByRole('button', { name: 'Remover observación' })).toBeInTheDocument();
    cleanup();
    montar({ data: [FILA] }, false, true);

    // Act
    await user.click(screen.getAllByRole('button', { name: 'Ver observaciones de Claridad' })[0]);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de Claridad' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remover observación' })).not.toBeInTheDocument();
  });

  it('«Cambiar puntaje» abre el panel de esa fila, cerrarlo lo desmonta y «Ver observaciones» sigue disponible', async () => {
    // Arrange
    const usuario = userEvent.setup();
    montar({ data: [FILA, OTRA_FILA] });

    // Act
    await usuario.click(screen.getAllByRole('button', { name: 'Cambiar puntaje de Rigor' })[0]);

    // Assert
    expect(screen.getByRole('dialog', { name: 'Cambio de puntaje de Rigor' })).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: 'Ver observaciones de Rigor' }).length,
    ).toBeGreaterThan(0);
    await usuario.click(screen.getByRole('button', { name: 'Cerrar cambio' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('sin «seleccion» no hay casillas y con ella hay una por fila que avisa el id al alternarla', async () => {
    // Arrange
    const onAlternar = vi.fn();
    const consulta: ConsultaCuantitativas = {
      data: [FILA],
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    const propiedades = {
      consulta,
      etiquetaVolver: 'Volver a mis evaluaciones',
      onVolver: vi.fn(),
      evaluacionJuradoId: 'ej-1',
    };
    const { unmount } = render(
      <ConsultarEvaluacionesCuantitativasRealizadasJurado {...propiedades} />,
    );

    // Assert
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    unmount();

    // Act
    render(
      <ConsultarEvaluacionesCuantitativasRealizadasJurado
        {...propiedades}
        seleccion={{ seleccionados: new Set(), onAlternar }}
      />,
    );
    await userEvent.click(screen.getAllByRole('checkbox', { name: 'Seleccionar Claridad' })[0]);

    // Assert
    expect(onAlternar).toHaveBeenCalledWith('ec-1');
  });

  it('con la evaluación finalizada no ofrece «Cambiar puntaje» y muestra el aviso', () => {
    // Arrange / Act
    montar({ data: [FILA] }, false, true);

    // Assert
    expect(screen.queryByRole('button', { name: /Cambiar puntaje/ })).not.toBeInTheDocument();
    expect(screen.getByText(/no se pueden omitir ni cambiar puntajes/)).toBeInTheDocument();
  });

  it('sin seleccion no hay casillas; con seleccion hay una por fila y alternarla entrega el id', async () => {
    // Arrange
    montar({ data: [FILA, OTRA_FILA] });

    // Assert
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    // Arrange
    cleanup();
    const onAlternar = vi.fn();
    render(
      <ConsultarEvaluacionesCuantitativasRealizadasJurado
        consulta={{
          data: [FILA, OTRA_FILA],
          error: null,
          isLoading: false,
          isError: false,
          refetch: vi.fn(),
        }}
        etiquetaVolver="Volver a mis evaluaciones"
        onVolver={vi.fn()}
        evaluacionJuradoId="ej-1"
        seleccion={{ seleccionados: new Set(['ec-1']), onAlternar }}
      />,
    );

    // Act
    await userEvent.click(screen.getAllByRole('checkbox', { name: 'Seleccionar Rigor' })[0]);

    // Assert
    expect(screen.getAllByRole('checkbox', { name: 'Seleccionar Claridad' })[0]).toBeChecked();
    expect(onAlternar).toHaveBeenCalledWith('ec-2');
  });
});
