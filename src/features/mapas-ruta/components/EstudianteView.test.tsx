import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import { useMapaRutaEstudiante } from '../hooks/useMapaRutaEstudiante';
import EstudianteView from './EstudianteView';

vi.mock('../hooks/useMapaRutaEstudiante', () => ({ useMapaRutaEstudiante: vi.fn() }));

const useHook = vi.mocked(useMapaRutaEstudiante);

type Retorno = ReturnType<typeof useMapaRutaEstudiante>;

function simular(parcial: Partial<Retorno>) {
  useHook.mockReturnValue({
    mapa: undefined,
    cargando: false,
    sinMapa: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  } as Retorno);
}

describe('EstudianteView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga muestra el encabezado y el estado de carga accesible', () => {
    // Arrange
    simular({ cargando: true });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('heading', { level: 1, name: 'Mi mapa de ruta' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Cargando tu mapa de ruta…');
  });

  it('sin mapa muestra el estado vacío y ningún error', () => {
    // Arrange
    simular({ sinMapa: true });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByText('Aún no tienes un mapa de ruta')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('con error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    const reintentar = vi.fn();
    simular({ hayError: true, reintentar });
    const user = userEvent.setup();

    // Act
    render(<EstudianteView />);
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos cargar tu mapa de ruta');
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('con datos muestra el título del proyecto y las fechas de inicio y fin', () => {
    // Arrange
    simular({
      mapa: {
        id: 'm-1',
        proyectoGradoId: 'p-1',
        titulo: 'Sistema A',
        fechaInicio: '2026-03-05',
        fechaFin: '2026-08-01',
      },
    });

    // Act
    render(<EstudianteView />);

    // Assert
    expect(screen.getByRole('heading', { level: 2, name: 'Sistema A' })).toBeInTheDocument();
    expect(screen.getByText('Fecha de inicio').nextElementSibling).toHaveTextContent('2026');
    expect(screen.getByText('Fecha de fin').nextElementSibling).toHaveTextContent('2026');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
