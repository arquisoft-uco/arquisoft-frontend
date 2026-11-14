import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import VistaPreviaPaqueteSeccion from './VistaPreviaPaqueteSeccion';

type Consulta = React.ComponentProps<typeof VistaPreviaPaqueteSeccion>['vistaPrevia'];

function consulta(parcial: object): Consulta {
  return { isLoading: false, isError: false, refetch: vi.fn(), ...parcial } as never;
}

describe('VistaPreviaPaqueteSeccion', () => {
  it('muestra el estado de carga', () => {
    // Act
    render(<VistaPreviaPaqueteSeccion vistaPrevia={consulta({ isLoading: true })} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista cada documento con su versión, la cantidad y la advertencia de empaquetado', () => {
    // Arrange
    const datos = {
      cantidad: 2,
      artefactos: [
        { artefacto: 'a-1', documento: 'Anteproyecto', numeroVersion: 3 },
        { artefacto: 'a-2', documento: 'Informe final', numeroVersion: 1 },
      ],
    };

    // Act
    render(<VistaPreviaPaqueteSeccion vistaPrevia={consulta({ data: datos })} />);

    // Assert
    expect(screen.getByText('Contenido del paquete · 2 documentos')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Anteproyecto')).toBeInTheDocument();
    expect(screen.getByText('Versión 3')).toBeInTheDocument();
    expect(screen.getByText('Informe final')).toBeInTheDocument();
    expect(screen.getByText('Versión 1')).toBeInTheDocument();
    expect(screen.getByText(/Se empaqueta solo la última versión/)).toBeInTheDocument();
  });

  it('con cantidad cero muestra el motivo y ninguna lista', () => {
    // Act
    render(
      <VistaPreviaPaqueteSeccion
        vistaPrevia={consulta({ data: { cantidad: 0, artefactos: [] } })}
      />,
    );

    // Assert
    expect(
      screen.getByText('No hay artefactos con revisión cerrada para empaquetar'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('ante un 422 de asesor no asignado muestra su mensaje propio y reintenta', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    const respuesta = {
      status: 422,
      data: { errorCode: 'ENTREGABLES_ASESOR_PROYECTO_GRADO_NO_ASIGNADO', message: 'x' },
    } as AxiosResponse;
    const error = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, respuesta);
    render(<VistaPreviaPaqueteSeccion vistaPrevia={consulta({ isError: true, error, refetch })} />);

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Ya no eres el asesor vigente de este proyecto.')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalled();
  });
});
