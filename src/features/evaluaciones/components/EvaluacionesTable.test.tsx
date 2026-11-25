import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import EvaluacionesTable from './EvaluacionesTable';
import type { Evaluacion } from '../models/Evaluacion';

const EVALUACION_1: Evaluacion = {
  id: 'e-1',
  entregable: { id: 'en-1', proyecto: 'Sistema de monitoreo', version: 2 },
  estado: { id: 'PENDIENTE', nombre: 'Pendiente' },
  notas: { notaAsesor: null, notaJurados: null, notaFinal: null },
  resultado: null,
};
const EVALUACION_2: Evaluacion = {
  id: 'e-2',
  entregable: { id: 'en-2', proyecto: 'Plataforma de riego', version: 1 },
  estado: { id: 'FINALIZADA', nombre: 'Finalizada' },
  notas: { notaAsesor: 4, notaJurados: 4.5, notaFinal: 4.2 },
  resultado: { id: 'APROBADA', nombre: 'Aprobada' },
};

function renderizar(parcial: Partial<React.ComponentProps<typeof EvaluacionesTable>> = {}) {
  const props = {
    evaluaciones: [EVALUACION_1, EVALUACION_2],
    cargando: false,
    hayFiltros: false,
    orden: { clave: 'proyecto', direccion: 'ASC' as const },
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
  const resultado = render(<EvaluacionesTable {...props} />);
  return { ...props, ...resultado };
}

// La tabla y la lista de tarjetas están las dos en el DOM (jsdom no aplica CSS): se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Evaluaciones' }));
}

describe('EvaluacionesTable', () => {
  it('muestra proyecto, versión y el nombre del estado que envía el backend', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla().getByText('2')).toBeInTheDocument();
    expect(tabla().getByText('Pendiente')).toBeInTheDocument();
    expect(tabla().getByText('Finalizada')).toBeInTheDocument();
  });

  it('muestra la nota final con su desglose y la insignia del resultado, o «—» si no se calculó', () => {
    // Act
    renderizar();

    // Assert
    const filas = tabla().getAllByRole('row');
    const conNotas = within(filas[2]);
    const sinCalcular = within(filas[1]);
    expect(conNotas.getByText('4,20')).toBeInTheDocument();
    expect(conNotas.getByText('Asesor 4,00 · Jurados 4,50')).toBeInTheDocument();
    expect(conNotas.getByText('Aprobada')).toBeInTheDocument();
    expect(sinCalcular.getByText('Asesor — · Jurados —')).toBeInTheDocument();
    expect(sinCalcular.getAllByText('Sin calcular')).toHaveLength(2);
    expect(sinCalcular.queryByText('Aprobada')).not.toBeInTheDocument();
  });

  it('pulsar las cabeceras Proyecto y Estado ordena por el campo correspondiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Proyecto' }));
    await user.click(tabla().getByRole('button', { name: 'Estado' }));

    // Assert
    expect(onOrdenar).toHaveBeenNthCalledWith(1, 'proyecto', 'DESC');
    expect(onOrdenar).toHaveBeenNthCalledWith(2, 'estado', 'ASC');
  });

  it('sin evaluaciones y sin filtros muestra el vacío informativo', () => {
    // Act
    renderizar({ evaluaciones: [] });

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('descripcionVacio reemplaza el texto del vacío sin filtros y no afecta al vacío con filtros', () => {
    // Arrange
    const texto = 'Texto propio del estudiante';
    const { unmount } = renderizar({ evaluaciones: [], descripcionVacio: texto });

    // Assert
    expect(screen.getByText(texto)).toBeInTheDocument();
    unmount();

    // Act
    renderizar({ evaluaciones: [], hayFiltros: true, descripcionVacio: texto });

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.queryByText(texto)).not.toBeInTheDocument();
  });

  it('sin evaluaciones y con filtros muestra "Sin resultados" y "Limpiar filtros" los quita', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onLimpiarFiltros } = renderizar({ evaluaciones: [], hayFiltros: true });

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('sin acciones no hay columna de acciones y con acciones se dibuja en cada fila', () => {
    // Arrange
    const { unmount } = renderizar();

    // Assert
    expect(tabla().getAllByRole('columnheader')).toHaveLength(5);
    unmount();

    // Act
    renderizar({
      acciones: (evaluacion) => <button type="button">Asignar a {evaluacion.id}</button>,
      encabezadoAcciones: 'Acciones',
    });

    // Assert
    expect(tabla().getAllByRole('columnheader')).toHaveLength(6);
    expect(tabla().getByRole('button', { name: 'Asignar a e-1' })).toBeInTheDocument();
    expect(tabla().getByRole('button', { name: 'Asignar a e-2' })).toBeInTheDocument();
  });
});
