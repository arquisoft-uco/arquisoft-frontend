import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../test-utils/render';
import SelectorAsesorFicha from './SelectorAsesorFicha';
import { useAsesoresFichaVigentes } from '../hooks/useAsesoresFichaVigentes';
import type { Asesor } from '../models/Asesor';

vi.mock('../hooks/useAsesoresFichaVigentes', () => ({
  useAsesoresFichaVigentes: vi.fn(),
}));

const useAsesoresFichaVigentesMock = vi.mocked(useAsesoresFichaVigentes);

type ResultadoAsesores = ReturnType<typeof useAsesoresFichaVigentes>;

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const LUIS: Asesor = { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };

function mockResultado(parcial: Partial<ResultadoAsesores>) {
  useAsesoresFichaVigentesMock.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    ...parcial,
  } as ResultadoAsesores);
}

describe('SelectorAsesorFicha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga mientras el catálogo de asesores no resuelve', () => {
    // Arrange
    mockResultado({ isLoading: true });

    // Act
    render(<SelectorAsesorFicha value="" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando asesores');
  });

  it('muestra el aviso de catálogo no disponible cuando el catálogo falla', () => {
    // Arrange
    mockResultado({ isError: true });

    // Act
    render(<SelectorAsesorFicha value="" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/catálogo de asesores/i);
  });

  it('lista los asesores excluyendo los ids indicados', () => {
    // Arrange
    mockResultado({ data: [ANA, LUIS] });

    // Act
    render(<SelectorAsesorFicha value="" onChange={vi.fn()} idsExcluidos={[ANA.id]} />);

    // Assert
    expect(screen.getByRole('option', { name: /Luis Gómez/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Ana Pérez/ })).not.toBeInTheDocument();
  });

  it('en modo solo lectura muestra el nombre del asesor seleccionado en vez del select', () => {
    // Arrange
    mockResultado({ data: [ANA, LUIS] });

    // Act
    render(<SelectorAsesorFicha value={LUIS.id} onChange={vi.fn()} soloLectura />);

    // Assert
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('deshabilita el select y muestra el placeholder cuando la exclusión deja la lista vacía', () => {
    // Arrange
    mockResultado({ data: [ANA] });

    // Act
    render(
      <SelectorAsesorFicha
        value=""
        onChange={vi.fn()}
        idsExcluidos={[ANA.id]}
        placeholder="-- Seleccionar nuevo asesor --"
      />,
    );

    // Assert
    expect(
      screen.getByRole('option', { name: '-- Seleccionar nuevo asesor --' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
