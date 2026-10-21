import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import RecibidasPanel from './RecibidasPanel';

vi.mock('./RespuestasRecibidasPanel', () => ({
  default: ({ filtros }: { filtros: FiltrosRespuestas }) => (
    <p>Respuestas del coordinador, página {filtros.page}</p>
  ),
}));

vi.mock('./RespuestasAsesorRecibidasPanel', () => ({
  default: ({ filtros }: { filtros: FiltrosRespuestas }) => (
    <p>Respuestas del asesor, página {filtros.page}</p>
  ),
}));

function crearFiltros(page: number): FiltrosRespuestas {
  return {
    page,
    estadoIds: [],
    ordenCampo: 'fechaRespuesta',
    ordenDireccion: 'DESC',
    hayFiltros: false,
    goToPage: vi.fn(),
    toggleEstado: vi.fn(),
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
  };
}

describe('RecibidasPanel', () => {
  it('muestra por defecto el coordinador y al cambiar de tipo entrega a cada panel sus propios filtros', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<RecibidasPanel filtros={{ coordinador: crearFiltros(2), asesor: crearFiltros(5) }} />);
    expect(screen.getByText('Respuestas del coordinador, página 2')).toBeInTheDocument();

    // Act
    await user.selectOptions(screen.getByRole('combobox', { name: 'Tipo de solicitud' }), 'asesor');

    // Assert
    expect(screen.getByText('Respuestas del asesor, página 5')).toBeInTheDocument();
    expect(screen.queryByText(/Respuestas del coordinador/)).not.toBeInTheDocument();

    // Act
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'coordinador',
    );

    // Assert
    expect(screen.getByText('Respuestas del coordinador, página 2')).toBeInTheDocument();
  });
});
