import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import CriteriosItemCualitativoAsesorPanel from './CriteriosItemCualitativoAsesorPanel';
import { useCriteriosItemCualitativoAsesor } from '../hooks/useCriteriosItemCualitativoAsesor';
import type { CriterioItemCualitativoAsesor } from '../models/CriterioItemCualitativoAsesor';

vi.mock('../hooks/useCriteriosItemCualitativoAsesor', () => ({
  useCriteriosItemCualitativoAsesor: vi.fn(),
}));

const CRITERIOS: CriterioItemCualitativoAsesor[] = [
  { id: 'c-2', nombre: 'Claridad', descripcion: 'Se comprende sin ambigüedades.' },
  { id: 'c-1', nombre: 'Aplicabilidad', descripcion: 'Resuelve un problema real.' },
];

function mockConsulta(parcial: Partial<ReturnType<typeof useCriteriosItemCualitativoAsesor>>) {
  vi.mocked(useCriteriosItemCualitativoAsesor).mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useCriteriosItemCualitativoAsesor>);
}

describe('CriteriosItemCualitativoAsesorPanel', () => {
  beforeEach(() => {
    vi.mocked(useCriteriosItemCualitativoAsesor).mockReset();
  });

  it('con datos, lista nombre y descripción de cada criterio en el orden recibido', () => {
    // Arrange
    mockConsulta({ data: CRITERIOS });

    // Act
    render(<CriteriosItemCualitativoAsesorPanel onCerrar={vi.fn()} />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Criterios de los ítems' });
    const elementos = within(lista).getAllByRole('listitem');
    expect(elementos).toHaveLength(2);
    expect(within(elementos[0]).getByText('Claridad')).toBeInTheDocument();
    expect(within(elementos[0]).getByText(CRITERIOS[0].descripcion)).toBeInTheDocument();
    expect(within(elementos[1]).getByText('Aplicabilidad')).toBeInTheDocument();
  });

  it('mientras carga, muestra el estado de carga accesible y no la lista', () => {
    // Arrange
    mockConsulta({ isLoading: true });

    // Act
    render(<CriteriosItemCualitativoAsesorPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando criterios/i);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('con lista vacía, muestra el mensaje de vacío y no un error', () => {
    // Arrange
    mockConsulta({ data: [] });

    // Act
    render(<CriteriosItemCualitativoAsesorPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Aún no hay criterios registrados')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra la alerta y Reintentar vuelve a consultar', async () => {
    // Arrange
    const refetch = vi.fn();
    mockConsulta({ isError: true, error: new Error('fallo de red'), refetch });
    const user = userEvent.setup();

    // Act
    render(<CriteriosItemCualitativoAsesorPanel onCerrar={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudieron cargar los criterios/i);
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('cerrar llama a onCerrar', async () => {
    // Arrange
    mockConsulta({ data: CRITERIOS });
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<CriteriosItemCualitativoAsesorPanel onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(onCerrar).toHaveBeenCalled();
  });
});
