import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import ItemsCualitativosAsesorView from './ItemsCualitativosAsesorView';
import { useItemsCualitativosAsesor } from '../hooks/useItemsCualitativosAsesor';
import { useCriteriosItemCualitativoAsesor } from '../hooks/useCriteriosItemCualitativoAsesor';
import { Rol } from '../../../shared/models/rol';
import {
  resetAllStores,
  setActiveRole,
  setAuthenticatedUser,
} from '../../../test-utils/store.utils';
import type { ItemCualitativoAsesor } from '../models/ItemCualitativoAsesor';

vi.mock('../hooks/useItemsCualitativosAsesor', () => ({
  useItemsCualitativosAsesor: vi.fn(),
}));

vi.mock('./RegistrarItemCualitativoAsesorPanel', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <button type="button" onClick={onCerrar}>
      Panel de registro
    </button>
  ),
}));

vi.mock('./ModificarItemCualitativoAsesorPanel', () => ({
  default: ({ item }: { item: ItemCualitativoAsesor }) => (
    <div>Panel de edición de {item.nombre}</div>
  ),
}));

vi.mock('./RemoverItemCualitativoAsesorDialog', () => ({
  default: ({ onCerrar }: { onCerrar: () => void }) => (
    <div role="alertdialog" aria-label="Confirmar remoción">
      <button type="button" onClick={onCerrar}>
        Cerrar diálogo
      </button>
    </div>
  ),
}));

vi.mock('../hooks/useCriteriosItemCualitativoAsesor', () => ({
  useCriteriosItemCualitativoAsesor: vi.fn(),
}));

const ITEMS: ItemCualitativoAsesor[] = [
  {
    id: 'i-2',
    nombre: 'Claridad',
    descripcion: 'El documento se comprende sin ambigüedades.',
    peso: 250,
  },
  {
    id: 'i-1',
    nombre: 'Rigor',
    descripcion: 'El método es consistente con los objetivos.',
    peso: 40,
  },
];

function mockConsulta(parcial: Partial<ReturnType<typeof useItemsCualitativosAsesor>>) {
  vi.mocked(useItemsCualitativosAsesor).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useItemsCualitativosAsesor>);
}

function entrarComo(rol: Rol) {
  setAuthenticatedUser({ tokenParsed: { sub: 'u', realm_access: { roles: [rol] } } });
  setActiveRole(rol);
}

describe('ItemsCualitativosAsesorView', () => {
  beforeEach(() => {
    resetAllStores();
    vi.mocked(useItemsCualitativosAsesor).mockReset();
    vi.mocked(useCriteriosItemCualitativoAsesor).mockReset();
    const parcial: Partial<ReturnType<typeof useCriteriosItemCualitativoAsesor>> = {
      data: [{ id: 'c-1', nombre: 'Aplicabilidad', descripcion: 'Resuelve un problema real.' }],
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    vi.mocked(useCriteriosItemCualitativoAsesor).mockReturnValue({
      ...parcial,
    } as ReturnType<typeof useCriteriosItemCualitativoAsesor>);
  });

  it('el panel de criterios solo se abre al pulsar «Ver criterios»', async () => {
    // Arrange
    mockConsulta({ data: ITEMS });
    const user = userEvent.setup();
    render(<ItemsCualitativosAsesorView />);
    expect(screen.queryByText('Criterios de los ítems')).toBeNull();

    // Act
    await user.click(screen.getByRole('button', { name: 'Ver criterios' }));

    // Assert
    expect(screen.getByText('Criterios de los ítems')).toBeInTheDocument();
    expect(screen.getByText('Aplicabilidad')).toBeInTheDocument();
  });

  it('como administrador ofrece «Registrar ítem», abre el panel y lo cierra', async () => {
    // Arrange
    mockConsulta({ data: ITEMS });
    entrarComo(Rol.Administrador);
    const user = userEvent.setup();
    render(<ItemsCualitativosAsesorView />);
    expect(screen.queryByText('Panel de registro')).toBeNull();

    // Act
    await user.click(screen.getByRole('button', { name: 'Registrar ítem' }));

    // Assert
    expect(screen.getByText('Panel de registro')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Panel de registro' }));
    expect(screen.queryByText('Panel de registro')).toBeNull();
  });

  it('como administrador, «Editar» abre el panel con el ítem de esa fila', async () => {
    // Arrange
    mockConsulta({ data: ITEMS });
    entrarComo(Rol.Administrador);
    const user = userEvent.setup();
    render(<ItemsCualitativosAsesorView />);

    // Act
    const tabla = screen.getByRole('table', { name: 'Ítems cualitativos del asesor' });
    await user.click(within(tabla).getByRole('button', { name: 'Editar ítem Rigor' }));

    // Assert
    expect(screen.getByText('Panel de edición de Rigor')).toBeInTheDocument();
  });

  it('como administrador, «Remover» por fila abre la confirmación y al cerrarla desaparece', async () => {
    // Arrange
    mockConsulta({ data: ITEMS });
    entrarComo(Rol.Administrador);
    const user = userEvent.setup();
    render(<ItemsCualitativosAsesorView />);

    // Act
    const tabla = screen.getByRole('table', { name: 'Ítems cualitativos del asesor' });
    expect(within(tabla).getAllByRole('button', { name: /^Remover ítem/ })).toHaveLength(2);
    await user.click(within(tabla).getByRole('button', { name: 'Remover ítem Rigor' }));

    // Assert
    expect(screen.getByRole('alertdialog', { name: 'Confirmar remoción' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar diálogo' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('como asesor no ofrece «Editar» ni «Registrar ítem»', () => {
    // Arrange
    mockConsulta({ data: ITEMS });
    entrarComo(Rol.Asesor);

    // Act
    render(<ItemsCualitativosAsesorView />);

    // Assert
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /editar|registrar ítem|remover/i })).toBeNull();
  });

  it('mientras carga, muestra el skeleton accesible', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    render(<ItemsCualitativosAsesorView />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ítems cualitativos del asesor');
  });

  it('con datos, muestra cada ítem en el orden recibido y no ofrece acciones de escritura', () => {
    // Arrange
    mockConsulta({ data: ITEMS });

    // Act
    render(<ItemsCualitativosAsesorView />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Ítems cualitativos del asesor' });
    const filas = within(tabla).getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Claridad')).toBeInTheDocument();
    expect(within(filas[0]).getByText(ITEMS[0].descripcion)).toBeInTheDocument();
    expect(within(filas[0]).getByText(String(ITEMS[0].peso))).toBeInTheDocument();
    expect(within(filas[1]).getByText('Rigor')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /registrar|editar|remover/i })).toBeNull();
  });

  it('con lista vacía, muestra el mensaje de vacío y no un error', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<ItemsCualitativosAsesorView />);

    // Assert
    expect(screen.getByText('No hay ítems cualitativos registrados.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('con error, muestra el mensaje y «Reintentar» invoca refetch', async () => {
    // Arrange
    const refetch = vi.fn();
    mockConsulta({ isError: true, error: new Error('Servicio caído'), refetch });
    const user = userEvent.setup();

    // Act
    render(<ItemsCualitativosAsesorView />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
