import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ObservacionesFichaTabla from './ObservacionesFichaTabla';

const BASE = {
  filas: [],
  totalElements: 0,
  totalPages: 0,
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
};

const FILA = {
  observacion: {
    id: 'o-1',
    revisionItemId: 'r-1',
    observacion: 'Ajustar el alcance',
    estadoId: 'PENDIENTE',
    estadoNombre: 'Pendiente',
  },
  item: {
    id: 'i-1',
    fichaPerfilId: 'f-1',
    tipoItem: { id: 't-1', nombre: 'Objetivo general' },
    contenido: 'Medir el impacto',
  },
};

describe('ObservacionesFichaTabla', () => {
  it('muestra por fila el ítem, la observación y el nombre del estado', () => {
    // Act
    render(<ObservacionesFichaTabla {...BASE} filas={[FILA]} totalElements={1} totalPages={1} />);

    // Assert
    const tabla = within(screen.getByRole('table', { name: 'Observaciones de ítems' }));
    expect(tabla.getByText('Objetivo general')).toBeInTheDocument();
    expect(tabla.getByText('Ajustar el alcance')).toBeInTheDocument();
    expect(tabla.getByText('Pendiente')).toBeInTheDocument();
  });

  it('muestra el esqueleto de carga', () => {
    // Act
    render(<ObservacionesFichaTabla {...BASE} isLoading />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con sinObservables muestra el vacío informativo y no un error', () => {
    // Act
    render(<ObservacionesFichaTabla {...BASE} sinObservables />);

    // Assert
    expect(screen.getByText('Esta ficha aún no tiene observaciones')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ante un error muestra el aviso y Reintentar llama a reintentar', async () => {
    // Arrange
    const reintentar = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<ObservacionesFichaTabla {...BASE} isError reintentar={reintentar} />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar las observaciones');
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('ordenar desde la cabecera Estado llama a ordenar con la dirección', async () => {
    // Arrange
    const ordenar = vi.fn();
    const user = userEvent.setup();
    render(
      <ObservacionesFichaTabla
        {...BASE}
        filas={[FILA]}
        totalElements={1}
        totalPages={1}
        ordenar={ordenar}
      />,
    );

    // Act
    await user.click(
      within(screen.getByRole('table', { name: 'Observaciones de ítems' })).getByRole('button', {
        name: 'Estado',
      }),
    );

    // Assert
    expect(ordenar).toHaveBeenCalledWith('ASC');
  });
});
