import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { render, screen } from '../../../../test-utils/render';
import JuradosEvaluacionCoordinadorView from './JuradosEvaluacionCoordinadorView';
import { useJuradosEvaluacion } from '../../hooks/useJuradosEvaluacion';
import type { ListadoJuradosEvaluacionData } from '../../hooks/useJuradosEvaluacion';
import { useResumenEvaluacion } from '../../hooks/useResumenEvaluacion';
import type { Page } from '../../../../shared/models/api-response';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';

vi.mock('../../hooks/useJuradosEvaluacion', () => ({ useJuradosEvaluacion: vi.fn() }));
vi.mock('../../hooks/useResumenEvaluacion', () => ({ useResumenEvaluacion: vi.fn() }));
vi.mock('./RemoverJuradoEvaluacionDialog', () => ({
  default: ({
    jurado,
    retrocederPagina,
    onRetroceder,
    onCerrar,
  }: {
    jurado: EvaluacionJurado;
    retrocederPagina: boolean;
    onRetroceder: () => void;
    onCerrar: () => void;
  }) => (
    <div role="alertdialog" aria-label={`Remover ${jurado.jurado.nombre}`}>
      <p>{retrocederPagina ? 'retrocede' : 'no retrocede'}</p>
      <button type="button" onClick={onRetroceder}>
        Simular retroceso
      </button>
      <button type="button" onClick={onCerrar}>
        Cerrar diálogo
      </button>
    </div>
  ),
}));
vi.mock('./AsignarJuradosEvaluacionPanel', () => ({
  default: ({ evaluacion, onCerrar }: { evaluacion: { id: string }; onCerrar: () => void }) => (
    <div role="dialog" aria-label={`Panel de ${evaluacion.id}`}>
      <button type="button" onClick={onCerrar}>
        Cerrar panel
      </button>
    </div>
  ),
}));

const ANA: EvaluacionJurado = {
  id: 'ej-1',
  jurado: { id: 'j-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  notas: { resumenCualitativo: null, resumenCuantitativo: null, notaAcumulada: null },
};

function crearPagina(content: EvaluacionJurado[]): Page<EvaluacionJurado> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function mockListado(parcial: Partial<ListadoJuradosEvaluacionData> = {}) {
  const listado = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    texto: '',
    setTexto: vi.fn(),
    ordenDireccion: 'ASC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ListadoJuradosEvaluacionData;
  vi.mocked(useJuradosEvaluacion).mockReturnValue(listado);
  return listado;
}

function mockResumen(finalizada?: boolean) {
  vi.mocked(useResumenEvaluacion).mockReturnValue({
    resumen: { id: 'e-1', proyecto: 'Sistema de monitoreo', version: 3, finalizada },
    search: '?q=sis',
  });
}

function montar() {
  return render(
    <Routes>
      <Route
        path="/evaluaciones/:evaluacionId/jurados"
        element={<JuradosEvaluacionCoordinadorView />}
      />
      <Route path="/evaluaciones" element={<div>Listado de evaluaciones</div>} />
    </Routes>,
    { initialPath: '/evaluaciones/e-1/jurados' },
  );
}

describe('JuradosEvaluacionCoordinadorView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista los jurados con la miga al listado y abre el diálogo desde «Remover a {nombre}»', async () => {
    // Arrange
    mockResumen(false);
    mockListado({ data: crearPagina([ANA]) });
    montar();

    // Assert
    expect(screen.getByRole('heading', { name: 'Jurados asignados' })).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo · versión 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Evaluaciones' })).toHaveAttribute(
      'href',
      '/evaluaciones?q=sis',
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Remover a Ana Pérez' })[0]);

    // Assert
    expect(screen.getByRole('alertdialog', { name: 'Remover Ana Pérez' })).toBeInTheDocument();
  });

  it('con la evaluación finalizada deshabilita «Remover» y muestra el aviso', () => {
    // Arrange
    mockResumen(true);
    mockListado({ data: crearPagina([ANA]) });

    // Act
    montar();

    // Assert
    expect(
      screen.getByText('Esta evaluación está finalizada y no admite cambios de jurados.'),
    ).toBeInTheDocument();
    for (const boton of screen.getAllByRole('button', { name: 'Remover a Ana Pérez' })) {
      expect(boton).toBeDisabled();
    }
  });

  it('sin jurados ofrece «Asignar jurados», abre el panel y lo cierra', async () => {
    // Arrange
    mockResumen(false);
    mockListado({ data: crearPagina([]) });
    montar();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Asignar jurados' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de e-1' })).toBeInTheDocument();

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con la evaluación finalizada no ofrece «Asignar jurados» en el vacío', () => {
    // Arrange
    mockResumen(true);
    mockListado({ data: crearPagina([]) });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Esta evaluación aún no tiene jurados asignados.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Asignar jurados' })).not.toBeInTheDocument();
  });

  it('sin resumen en el state ni en el snapshot redirige al listado de evaluaciones', () => {
    // Arrange
    vi.mocked(useResumenEvaluacion).mockReturnValue({ resumen: null, search: '' });
    mockListado({ data: crearPagina([ANA]) });

    // Act
    montar();

    // Assert
    expect(screen.getByText('Listado de evaluaciones')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Jurados asignados' })).not.toBeInTheDocument();
  });

  it('si queda una sola fila en una página posterior, el diálogo retrocede una página', async () => {
    // Arrange
    mockResumen(false);
    const listado = mockListado({ data: crearPagina([ANA]), page: 2 });
    montar();

    // Act
    await userEvent.click(screen.getAllByRole('button', { name: 'Remover a Ana Pérez' })[0]);
    await userEvent.click(screen.getByRole('button', { name: 'Simular retroceso' }));

    // Assert
    expect(screen.getByText('retrocede')).toBeInTheDocument();
    expect(listado.goToPage).toHaveBeenCalledWith(1);
  });
});
