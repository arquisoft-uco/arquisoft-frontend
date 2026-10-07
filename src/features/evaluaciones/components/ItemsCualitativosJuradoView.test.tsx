import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import { Rol } from '../../../shared/models/rol';
import ItemsCualitativosJuradoView from './ItemsCualitativosJuradoView';
import { useItemsCualitativosJurado } from '../hooks/useItemsCualitativosJurado';
import { useRegistrarItemCualitativoJurado } from '../hooks/useRegistrarItemCualitativoJurado';
import type { ItemCualitativoJurado } from '../models/ItemCualitativoJurado';

vi.mock('../hooks/useItemsCualitativosJurado', () => ({
  useItemsCualitativosJurado: vi.fn(),
}));

vi.mock('../hooks/useRegistrarItemCualitativoJurado', () => ({
  useRegistrarItemCualitativoJurado: vi.fn(),
}));

const ITEMS: ItemCualitativoJurado[] = [
  { id: 'i-2', nombre: 'Claridad', descripcion: 'El documento se comprende sin ambigüedades.' },
  {
    id: 'i-1',
    nombre: 'Aplicabilidad',
    descripcion: 'La propuesta resuelve un problema real del contexto.',
  },
];

function mockConsulta(parcial: Partial<ReturnType<typeof useItemsCualitativosJurado>>) {
  vi.mocked(useItemsCualitativosJurado).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ReturnType<typeof useItemsCualitativosJurado>);
}

describe('ItemsCualitativosJuradoView', () => {
  beforeEach(() => {
    vi.mocked(useItemsCualitativosJurado).mockReset();
    resetAllStores();
    setAuthenticatedUser({
      tokenParsed: { realm_access: { roles: [Rol.Administrador, Rol.Jurado] } },
    });
  });

  it('con datos, muestra nombre y descripción completa de cada ítem en el orden recibido', () => {
    // Arrange
    mockConsulta({ data: ITEMS });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Ítems cualitativos del jurado' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Claridad')).toBeInTheDocument();
    expect(within(filas[0]).getByText(ITEMS[0].descripcion)).toBeInTheDocument();
    expect(within(filas[1]).getByText('Aplicabilidad')).toBeInTheDocument();
    expect(within(filas[1]).getByText(ITEMS[1].descripcion)).toBeInTheDocument();
  });

  it('con lista vacía, muestra el mensaje de vacío y no un error', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    expect(screen.getByText('No hay ítems cualitativos registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mientras carga, muestra el estado de carga accesible y no la tabla', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems cualitativos del jurado');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra un bloque de error con role alert y no la tabla', () => {
    // Arrange
    mockConsulta({ isError: true, error: new Error('fallo de red') });

    // Act
    render(<ItemsCualitativosJuradoView />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudieron cargar los ítems/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('el administrador ve Registrar ítem y el jurado no', () => {
    // Arrange
    mockConsulta({ data: ITEMS });
    setActiveRole(Rol.Administrador);
    const { unmount } = render(<ItemsCualitativosJuradoView />);
    expect(screen.getByRole('button', { name: 'Registrar ítem' })).toBeInTheDocument();
    unmount();

    // Act
    setActiveRole(Rol.Jurado);
    render(<ItemsCualitativosJuradoView />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Registrar ítem' })).not.toBeInTheDocument();
  });

  it('abre el panel de registro sobre la lista y lo cierra sin perderla', async () => {
    // Arrange
    mockConsulta({ data: ITEMS });
    vi.mocked(useRegistrarItemCualitativoJurado).mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
      reset: vi.fn(),
    } as Partial<ReturnType<typeof useRegistrarItemCualitativoJurado>> as ReturnType<
      typeof useRegistrarItemCualitativoJurado
    >);
    setActiveRole(Rol.Administrador);
    const user = userEvent.setup();
    render(<ItemsCualitativosJuradoView />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar ítem' }));

    // Assert
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Ítems cualitativos del jurado' }),
    ).toBeInTheDocument();
  });
});
