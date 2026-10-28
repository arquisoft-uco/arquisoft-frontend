import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { FiltrosRespuestas } from '../../hooks/useFiltrosRespuestas';
import RespuestasEnviadasPorTipoPanel from './RespuestasEnviadasPorTipoPanel';

interface PropsPanel {
  filtros: FiltrosRespuestas;
}

vi.mock('./RespuestasEnviadasPanel', () => ({
  default: ({ filtros }: PropsPanel) => <p>Panel de novedad, página {filtros.page}</p>,
}));

vi.mock('./RespuestasAmpliacionPlazoEnviadasPanel', () => ({
  default: ({ filtros }: PropsPanel) => <p>Panel de ampliación de plazo, página {filtros.page}</p>,
}));

vi.mock('./RespuestasCambioAsesorEnviadasPanel', () => ({
  default: ({ filtros }: PropsPanel) => <p>Panel de cambio de asesor, página {filtros.page}</p>,
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

describe('RespuestasEnviadasPorTipoPanel', () => {
  it('arranca en novedad y al cambiar de tipo entrega a cada panel sus propios filtros', async () => {
    // Arrange
    const user = userEvent.setup();
    render(
      <RespuestasEnviadasPorTipoPanel
        filtros={{
          novedad: crearFiltros(2),
          'cambio-asesor': crearFiltros(5),
          'ampliacion-plazo': crearFiltros(7),
        }}
      />,
    );

    // Assert
    expect(screen.getByText('Panel de novedad, página 2')).toBeInTheDocument();

    // Act
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'cambio-asesor',
    );

    // Assert
    expect(screen.getByText('Panel de cambio de asesor, página 5')).toBeInTheDocument();
    expect(screen.queryByText(/Panel de novedad/)).not.toBeInTheDocument();

    // Act
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Tipo de solicitud' }),
      'ampliacion-plazo',
    );

    // Assert
    expect(screen.getByText('Panel de ampliación de plazo, página 7')).toBeInTheDocument();
    expect(screen.queryByText(/Panel de cambio de asesor/)).not.toBeInTheDocument();
  });
});
