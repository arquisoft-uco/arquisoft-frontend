import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesEnviadasTable from './SolicitudesEnviadasTable';

const FECHA_ISO = '2026-09-01T15:30:00Z';

const SOLICITUDES: Solicitud[] = [
  {
    id: 's-1',
    mensajeSolicitud: 'No he podido contactar a mi asesor.',
    fechaCreacion: FECHA_ISO,
    tipoSolicitudId: 't-1',
    tipoSolicitudNombre: 'NOVEDAD_PARA_EL_COORDINADOR',
    remitente: {
      usuarioId: 'u-1',
      identificador: '2001',
      nombre: 'Luis',
      email: 'luis@uco.edu.co',
    },
    destinatario: {
      usuarioId: 'u-2',
      identificador: '1001',
      nombre: 'Ana Pérez',
      email: 'ana@uco.edu.co',
    },
  },
  {
    id: 's-2',
    mensajeSolicitud: 'Necesito reunirme antes del corte.',
    fechaCreacion: '2026-09-05T10:00:00Z',
    tipoSolicitudId: 't-1',
    tipoSolicitudNombre: 'NOVEDAD_PARA_EL_COORDINADOR',
    remitente: {
      usuarioId: 'u-1',
      identificador: '2001',
      nombre: 'Luis',
      email: 'luis@uco.edu.co',
    },
    destinatario: {
      usuarioId: 'u-3',
      identificador: '1002',
      nombre: 'Carlos Ruiz',
      email: 'carlos@uco.edu.co',
    },
  },
];

function tabla() {
  return screen.getByRole('table', { name: 'Solicitudes de novedad enviadas al coordinador' });
}

function renderizar(parcial: Partial<React.ComponentProps<typeof SolicitudesEnviadasTable>> = {}) {
  const props = {
    solicitudes: SOLICITUDES,
    cargando: false,
    eliminando: false,
    onEliminar: vi.fn(),
    ...parcial,
  };
  render(<SolicitudesEnviadasTable {...props} />);
  return props;
}

describe('SolicitudesEnviadasTable', () => {
  it('muestra una fila por solicitud con coordinador, correo, mensaje y la fecha ISO en <time>', () => {
    // Arrange
    const props = { solicitudes: SOLICITUDES };

    // Act
    renderizar(props);

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Solicitudes de novedad enviadas al coordinador',
    });
    const filas = within(tabla).getAllByRole('row');
    expect(filas).toHaveLength(SOLICITUDES.length + 1);
    expect(within(filas[1]).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(filas[1]).getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(within(filas[1]).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(filas[1].querySelector('time')).toHaveAttribute('datetime', FECHA_ISO);
    expect(within(filas[2]).getByText('Carlos Ruiz')).toBeInTheDocument();
  });

  it('sin solicitudes muestra el vacío con el siguiente paso y sin tabla', () => {
    // Arrange
    const props = { solicitudes: [] };

    // Act
    renderizar(props);

    // Assert
    expect(screen.getByText('Aún no has enviado solicitudes')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('mientras carga muestra el esqueleto y no la tabla', () => {
    // Arrange
    const props = { cargando: true };

    // Act
    renderizar(props);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('el botón de eliminar de una fila llama a onEliminar con esa solicitud', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onEliminar } = renderizar();

    // Act
    await user.click(
      within(tabla()).getByRole('button', { name: 'Eliminar la solicitud enviada a Carlos Ruiz' }),
    );

    // Assert
    expect(onEliminar).toHaveBeenCalledTimes(1);
    expect(onEliminar).toHaveBeenCalledWith(SOLICITUDES[1]);
  });

  it('deshabilita todos los botones de eliminar mientras se elimina', () => {
    // Arrange / Act
    renderizar({ eliminando: true });

    // Assert
    expect(
      within(tabla()).getByRole('button', { name: 'Eliminar la solicitud enviada a Ana Pérez' }),
    ).toBeDisabled();
    expect(
      within(tabla()).getByRole('button', { name: 'Eliminar la solicitud enviada a Carlos Ruiz' }),
    ).toBeDisabled();
  });
});
