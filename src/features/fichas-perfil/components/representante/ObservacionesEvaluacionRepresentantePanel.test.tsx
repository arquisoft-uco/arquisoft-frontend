import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { useObservacionesEvaluacionRepresentante } from '../../hooks/useObservacionesEvaluacionRepresentante';
import { useRemoverObservacionEvaluacion } from '../../hooks/useRemoverObservacionEvaluacion';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import ObservacionesEvaluacionRepresentantePanel from './ObservacionesEvaluacionRepresentantePanel';

vi.mock('../../hooks/useObservacionesEvaluacionRepresentante', () => ({
  useObservacionesEvaluacionRepresentante: vi.fn(),
}));
vi.mock('../../hooks/useModificarObservacionEvaluacion', () => ({
  useModificarObservacionEvaluacion: vi.fn(() => ({
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('../../hooks/useRemoverObservacionEvaluacion', () => ({
  useRemoverObservacionEvaluacion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const EVALUACION: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-09-01T10:00:00Z',
  estadoEvaluacionId: 'APROBADA',
  estadoEvaluacionNombre: 'Aprobada',
};

const EVALUACION_ABIERTA: EvaluacionFichaPerfil = {
  ...EVALUACION,
  estadoEvaluacionId: null,
  estadoEvaluacionNombre: null,
};

function conObservaciones(
  parcial: Partial<ReturnType<typeof useObservacionesEvaluacionRepresentante>>,
) {
  vi.mocked(useObservacionesEvaluacionRepresentante).mockReturnValue({
    observaciones: [],
    isLoading: false,
    cargado: true,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useObservacionesEvaluacionRepresentante>);
}

describe('ObservacionesEvaluacionRepresentantePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga y no pinta el vacío', () => {
    // Arrange
    conObservaciones({ isLoading: true, cargado: false });

    // Act
    render(
      <ObservacionesEvaluacionRepresentantePanel evaluacion={EVALUACION} onCerrar={vi.fn()} />,
    );

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando observaciones…');
    expect(
      screen.queryByText('Esta evaluación aún no tiene observaciones'),
    ).not.toBeInTheDocument();
  });

  it('ante un error muestra la alerta y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    conObservaciones({ isError: true, cargado: false, error: new Error('fallo'), refetch });
    render(
      <ObservacionesEvaluacionRepresentantePanel evaluacion={EVALUACION} onCerrar={vi.fn()} />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las observaciones');
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sin observaciones muestra el vacío neutro', () => {
    // Arrange
    conObservaciones({ observaciones: [] });

    // Act
    render(
      <ObservacionesEvaluacionRepresentantePanel evaluacion={EVALUACION} onCerrar={vi.fn()} />,
    );

    // Assert
    expect(screen.getByText('Esta evaluación aún no tiene observaciones')).toBeInTheDocument();
    expect(screen.getByText('Cuando las registres, las verás aquí.')).toBeInTheDocument();
  });

  it('lista las observaciones con el estado y «Cerrar» invoca onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    conObservaciones({
      observaciones: [
        { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
        { id: 'o-2', evaluacionFichaPerfilId: 'ev-1', observacion: 'Precisar la metodología' },
      ],
    });
    render(
      <ObservacionesEvaluacionRepresentantePanel evaluacion={EVALUACION} onCerrar={onCerrar} />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.getByText('Ajustar el alcance')).toBeInTheDocument();
    expect(screen.getByText('Precisar la metodología')).toBeInTheDocument();
    expect(screen.getByText('Aprobada')).toBeInTheDocument();
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('con la evaluación descartada lista las observaciones sin «Editar» ni «Eliminar»; en curso ofrece ambos', () => {
    // Arrange
    conObservaciones({
      observaciones: [
        { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
      ],
    });

    // Act
    const descartada = render(
      <ObservacionesEvaluacionRepresentantePanel
        evaluacion={{
          ...EVALUACION,
          estadoEvaluacionId: 'DESCARTADA',
          estadoEvaluacionNombre: 'Descartada',
        }}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Ajustar el alcance')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar observación' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar observación' })).not.toBeInTheDocument();
    descartada.unmount();

    // Act
    render(
      <ObservacionesEvaluacionRepresentantePanel
        evaluacion={EVALUACION_ABIERTA}
        onCerrar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByRole('button', { name: 'Editar observación' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eliminar observación' })).toBeInTheDocument();
  });

  it('«Editar observación» abre el formulario con el texto de esa fila y al cerrarlo el panel sigue abierto', async () => {
    // Arrange
    const user = userEvent.setup();
    conObservaciones({
      observaciones: [
        { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
        { id: 'o-2', evaluacionFichaPerfilId: 'ev-1', observacion: 'Precisar la metodología' },
      ],
    });
    render(
      <ObservacionesEvaluacionRepresentantePanel evaluacion={EVALUACION} onCerrar={vi.fn()} />,
    );

    // Act
    const botones = screen.getAllByRole('button', { name: 'Editar observación' });
    await user.click(botones[1]);

    // Assert
    expect(botones).toHaveLength(2);
    expect(screen.getByRole('textbox', { name: 'Observación' })).toHaveValue(
      'Precisar la metodología',
    );

    // Act
    await user.click(
      within(screen.getByRole('dialog', { name: 'Editar observación' })).getByRole('button', {
        name: 'Cerrar',
      }),
    );

    // Assert
    expect(screen.queryByRole('textbox', { name: 'Observación' })).not.toBeInTheDocument();
    expect(screen.getByText('Ajustar el alcance')).toBeInTheDocument();
  });

  describe('Eliminar observación', () => {
    const OBSERVACIONES = [
      { id: 'o-1', evaluacionFichaPerfilId: 'ev-1', observacion: 'Ajustar el alcance' },
      { id: 'o-2', evaluacionFichaPerfilId: 'ev-1', observacion: 'Precisar la metodología' },
    ];

    function conRemover(mutate: ReturnType<typeof vi.fn>) {
      vi.mocked(useRemoverObservacionEvaluacion).mockReturnValue({
        mutate,
        isPending: false,
      } as never);
    }

    it('pide confirmación con el texto de esa fila y «Cancelar» cierra sin enviar', async () => {
      // Arrange
      const user = userEvent.setup();
      const mutate = vi.fn();
      conRemover(mutate);
      conObservaciones({ observaciones: OBSERVACIONES });
      render(
        <ObservacionesEvaluacionRepresentantePanel
          evaluacion={EVALUACION_ABIERTA}
          onCerrar={vi.fn()}
        />,
      );

      // Act
      const botones = screen.getAllByRole('button', { name: 'Eliminar observación' });
      await user.click(botones[1]);

      // Assert
      const dialogo = screen.getByRole('alertdialog', { name: '¿Eliminar observación?' });
      expect(botones).toHaveLength(2);
      expect(within(dialogo).getByText(/Precisar la metodología/)).toBeInTheDocument();
      expect(mutate).not.toHaveBeenCalled();

      // Act
      await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

      // Assert
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
      expect(mutate).not.toHaveBeenCalled();
    });

    it('con la evaluación en estado final no ofrece «Eliminar observación» pero sí «Editar observación»', () => {
      // Arrange
      conObservaciones({ observaciones: OBSERVACIONES });

      // Act
      render(
        <ObservacionesEvaluacionRepresentantePanel evaluacion={EVALUACION} onCerrar={vi.fn()} />,
      );

      // Assert
      expect(
        screen.queryByRole('button', { name: 'Eliminar observación' }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Editar observación' })).toHaveLength(2);
    });
  });
});
