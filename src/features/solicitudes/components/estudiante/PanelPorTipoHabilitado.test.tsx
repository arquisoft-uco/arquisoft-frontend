import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import PanelPorTipoHabilitado from './PanelPorTipoHabilitado';
import { TIPOS_SOLICITUD_NUEVA } from '../SelectorTipoSolicitud';
import { useTiposSolicitud } from '../../hooks/useTiposSolicitud';
import type { TipoSolicitud } from '../../models/TipoSolicitud';

vi.mock('../../hooks/useTiposSolicitud', () => ({ useTiposSolicitud: vi.fn() }));

const TIPOS: TipoSolicitud[] = [
  { id: 'AMPLIACION_DE_PLAZO', nombre: 'Ampliación de Plazo', descripcion: 'd' },
  { id: 'CAMBIO_DE_ASESOR', nombre: 'Cambio de Asesor', descripcion: 'd' },
  { id: 'NOVEDAD_PARA_EL_ASESOR', nombre: 'Novedad para el Asesor', descripcion: 'd' },
  { id: 'NOVEDAD_PARA_EL_COORDINADOR', nombre: 'Novedad para el Coordinador', descripcion: 'd' },
];

function mockCatalogo(parcial: Partial<ReturnType<typeof useTiposSolicitud>>) {
  vi.mocked(useTiposSolicitud).mockReturnValue({
    data: undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useTiposSolicitud>);
}

function renderizarPanel() {
  return render(
    <PanelPorTipoHabilitado
      opciones={TIPOS_SOLICITUD_NUEVA}
      renderizar={(tipo) => <p>Panel {tipo}</p>}
    />,
  );
}

describe('PanelPorTipoHabilitado', () => {
  beforeEach(() => {
    vi.mocked(useTiposSolicitud).mockReset();
  });

  it('con los cuatro tipos muestra los nombres del backend en el orden local y el panel del coordinador', async () => {
    // Arrange
    mockCatalogo({ data: TIPOS });
    const user = userEvent.setup();

    // Act
    renderizarPanel();

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Novedad para el Coordinador',
      'Novedad para el Asesor',
      'Cambio de Asesor',
      'Ampliación de Plazo',
    ]);
    expect(screen.getByText('Panel coordinador')).toBeInTheDocument();

    // Act
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo de solicitud' }), 'asesor');

    // Assert
    expect(screen.getByText('Panel asesor')).toBeInTheDocument();
  });

  it('con un subconjunto sin el del coordinador ofrece solo los devueltos y elige el primero', () => {
    // Arrange
    mockCatalogo({ data: TIPOS.filter((t) => t.id !== 'NOVEDAD_PARA_EL_COORDINADOR') });

    // Act
    renderizarPanel();

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
      'Novedad para el Asesor',
      'Cambio de Asesor',
      'Ampliación de Plazo',
    ]);
    expect(screen.getByText('Panel asesor')).toBeInTheDocument();
  });

  it('ignora un id desconocido del backend sin error', () => {
    // Arrange
    mockCatalogo({
      data: [
        { id: 'REGISTRO_Y_MODIFICACION_DE_USUARIOS', nombre: 'Registro', descripcion: 'd' },
        TIPOS[1],
      ],
    });

    // Act
    renderizarPanel();

    // Assert
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Cambio de Asesor']);
  });

  it('con la lista vacía muestra el estado vacío y no el selector', () => {
    // Arrange
    mockCatalogo({ data: [] });

    // Act
    renderizarPanel();

    // Assert
    expect(screen.getByText('No tienes tipos de solicitud habilitados')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('ante un error muestra el estado de error y Reintentar repite la consulta', async () => {
    // Arrange
    const refetch = vi.fn();
    mockCatalogo({ isError: true, refetch });
    const user = userEvent.setup();

    // Act
    renderizarPanel();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByText('No pudimos cargar los tipos de solicitud')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('mientras carga muestra el estado de carga y no el selector', () => {
    // Arrange
    mockCatalogo({ isPending: true });

    // Act
    renderizarPanel();

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });
});
