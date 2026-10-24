import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import ListadoJuradosEvaluacion from './ListadoJuradosEvaluacion';
import type { ListadoJuradosEvaluacionData } from '../../hooks/useJuradosEvaluacion';
import type { Page } from '../../../../shared/models/api-response';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';

const JURADO: EvaluacionJurado = {
  id: 'ej-1',
  jurado: { id: 'j-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
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

function crearListado(parcial: Partial<ListadoJuradosEvaluacionData> = {}) {
  return {
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
}

describe('ListadoJuradosEvaluacion', () => {
  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Act
    render(
      <ListadoJuradosEvaluacion listado={crearListado({ isLoading: true })} onVolver={vi.fn()} />,
    );

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('lista nombre y correo del jurado con el resumen de la cantidad', () => {
    // Act
    render(
      <ListadoJuradosEvaluacion
        listado={crearListado({ data: crearPagina([JURADO]) })}
        onVolver={vi.fn()}
      />,
    );

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Jurados de la evaluación' }));
    expect(tabla.getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla.getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('1 jurado')).toBeInTheDocument();
    expect(tabla.getAllByRole('columnheader')).toHaveLength(2);
  });

  it('sin jurados asignados muestra el vacío y no un error', () => {
    // Act
    render(
      <ListadoJuradosEvaluacion
        listado={crearListado({ data: crearPagina([]) })}
        onVolver={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Aún no hay jurados asignados')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  it('con búsqueda sin coincidencias ofrece "Limpiar filtros" que limpia el listado', async () => {
    // Arrange
    const user = userEvent.setup();
    const listado = crearListado({ data: crearPagina([]), texto: 'zzz' });
    render(<ListadoJuradosEvaluacion listado={listado} onVolver={vi.fn()} />);

    // Act
    const botones = screen.getAllByRole('button', { name: 'Limpiar filtros' });
    await user.click(botones[botones.length - 1]);

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(listado.limpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('en error muestra el aviso, reintenta, vuelve a evaluaciones y oculta el paginador', async () => {
    // Arrange
    const user = userEvent.setup();
    const listado = crearListado({ isError: true, error: new Error('fallo') });
    const onVolver = vi.fn();
    render(<ListadoJuradosEvaluacion listado={listado} onVolver={onVolver} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await user.click(screen.getByRole('button', { name: 'Volver a evaluaciones' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los jurados');
    expect(listado.refetch).toHaveBeenCalledTimes(1);
    expect(onVolver).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('navigation', { name: 'Paginación' })).not.toBeInTheDocument();
  });

  it('alternar el encabezado "Jurado" invierte el orden', async () => {
    // Arrange
    const user = userEvent.setup();
    const listado = crearListado({ data: crearPagina([JURADO]) });
    render(<ListadoJuradosEvaluacion listado={listado} onVolver={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: /Jurado/ }));

    // Assert
    expect(listado.setOrden).toHaveBeenCalledWith('DESC');
  });

  it('con acciones pasadas agrega la columna "Acciones" (punto de extensión de HU-016)', () => {
    // Act
    render(
      <ListadoJuradosEvaluacion
        listado={crearListado({ data: crearPagina([JURADO]) })}
        onVolver={vi.fn()}
        encabezadoAcciones="Acciones"
        acciones={(jurado) => <button type="button">Ver {jurado.jurado.nombre}</button>}
      />,
    );

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Jurados de la evaluación' }));
    expect(tabla.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
    expect(tabla.getAllByRole('button', { name: 'Ver Ana Pérez' }).length).toBeGreaterThan(0);
  });
});
