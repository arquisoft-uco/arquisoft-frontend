import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useModificarObservacionItem } from '../../hooks/useModificarObservacionItem';
import { useObservacionesFichaAsesor } from '../../hooks/useObservacionesFichaAsesor';
import ObservacionesFichaAsesorPanel from './ObservacionesFichaAsesorPanel';

vi.mock('../../hooks/useObservacionesFichaAsesor', () => ({
  useObservacionesFichaAsesor: vi.fn(),
}));

vi.mock('../../hooks/useModificarObservacionItem', () => ({
  useModificarObservacionItem: vi.fn(),
}));

type Resultado = ReturnType<typeof useObservacionesFichaAsesor>;

function fila(id: string, nombreItem: string, revisionCerrada: boolean) {
  return {
    observacion: {
      id,
      revisionItemId: `r-${id}`,
      observacion: `Texto ${id}`,
      estadoId: 'PENDIENTE',
      estadoNombre: 'Pendiente',
    },
    item: {
      id: `i-${id}`,
      fichaPerfilId: 'f-1',
      tipoItem: { id: 't-1', nombre: nombreItem },
      contenido: 'Contenido',
    },
    revisionCerrada,
  };
}

function conFilas(filas: Resultado['filas']) {
  vi.mocked(useObservacionesFichaAsesor).mockReturnValue({
    filas,
    totalElements: filas.length,
    totalPages: 1,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    direccion: undefined,
    ordenar: vi.fn(),
    sinObservables: false,
    isLoading: false,
    isError: false,
    error: null,
    reintentar: vi.fn(),
  });
  const mutacion: Partial<Record<keyof ReturnType<typeof useModificarObservacionItem>, unknown>> = {
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
  };
  vi.mocked(useModificarObservacionItem).mockReturnValue(
    mutacion as ReturnType<typeof useModificarObservacionItem>,
  );
}

describe('ObservacionesFichaAsesorPanel', () => {
  it('consulta las observaciones de la ficha y renderiza sus filas', () => {
    // Arrange
    vi.mocked(useObservacionesFichaAsesor).mockReturnValue({
      filas: [
        {
          observacion: {
            id: 'o-1',
            revisionItemId: 'r-1',
            observacion: 'Ajustar el alcance',
            estadoId: 'EN_PROGRESO',
            estadoNombre: 'En progreso',
          },
          item: {
            id: 'i-1',
            fichaPerfilId: 'f-1',
            tipoItem: { id: 't-1', nombre: 'Objetivo general' },
            contenido: 'Medir el impacto',
          },
          revisionCerrada: false,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      pageSize: 10,
      goToPage: vi.fn(),
      direccion: undefined,
      ordenar: vi.fn(),
      sinObservables: false,
      isLoading: false,
      isError: false,
      error: null,
      reintentar: vi.fn(),
    });

    // Act
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(useObservacionesFichaAsesor).toHaveBeenCalledWith('f-1');
    expect(screen.getAllByText('Ajustar el alcance').length).toBeGreaterThan(0);
    expect(screen.getAllByText('En progreso').length).toBeGreaterThan(0);
  });

  it('ofrece Editar observación solo en filas de revisión abierta y la elección abre el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    conFilas([fila('1', 'Objetivo general', false), fila('2', 'Alcance', true)]);
    render(<ObservacionesFichaAsesorPanel fichaPerfilId="f-1" />);

    // Assert
    expect(
      screen.getAllByRole('button', { name: /Acciones de la observación de Objetivo general/ })
        .length,
    ).toBeGreaterThan(0);
    expect(
      screen.queryByRole('button', { name: /Acciones de la observación de Alcance/ }),
    ).not.toBeInTheDocument();

    // Act
    await user.click(
      screen.getAllByRole('button', { name: /Acciones de la observación de Objetivo general/ })[0],
    );
    await user.click(screen.getByRole('menuitem', { name: 'Editar observación' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Editar observación' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Observación' })).toHaveValue('Texto 1');
  });
});
