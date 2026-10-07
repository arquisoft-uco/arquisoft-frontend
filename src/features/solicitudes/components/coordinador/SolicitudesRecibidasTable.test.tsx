import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import type { Solicitud } from '../../models/Solicitud';
import SolicitudesRecibidasTable from './SolicitudesRecibidasTable';

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
      nombre: 'Luis Gómez',
      email: 'luis@uco.edu.co',
    },
    destinatario: {
      usuarioId: 'u-9',
      identificador: '1001',
      nombre: 'Ana',
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
      usuarioId: 'u-3',
      identificador: '2002',
      nombre: 'María Torres',
      email: 'maria@uco.edu.co',
    },
    destinatario: {
      usuarioId: 'u-9',
      identificador: '1001',
      nombre: 'Ana',
      email: 'ana@uco.edu.co',
    },
  },
];

function renderizar(parcial: Partial<React.ComponentProps<typeof SolicitudesRecibidasTable>> = {}) {
  const props = {
    solicitudes: SOLICITUDES,
    cargando: false,
    onResponder: vi.fn(),
    ...parcial,
  };
  render(<SolicitudesRecibidasTable {...props} />);
  return props;
}

describe('SolicitudesRecibidasTable', () => {
  it('muestra una fila por solicitud con remitente, correo, mensaje y la fecha ISO en <time>', () => {
    // Arrange / Act
    renderizar();

    // Assert
    const tabla = screen.getByRole('table', { name: 'Solicitudes de novedad recibidas' });
    const filas = within(tabla).getAllByRole('row');
    expect(filas).toHaveLength(SOLICITUDES.length + 1);
    expect(within(filas[1]).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(filas[1]).getByText(/2001.*luis@uco.edu.co/)).toBeInTheDocument();
    expect(within(filas[1]).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(filas[1].querySelector('time')).toHaveAttribute('datetime', FECHA_ISO);
    expect(within(filas[2]).getByText('María Torres')).toBeInTheDocument();
  });

  it('sin solicitudes muestra el vacío y no la tabla', () => {
    // Arrange / Act
    renderizar({ solicitudes: [] });

    // Assert
    expect(screen.getByText('Aún no has recibido solicitudes')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('mientras carga muestra el esqueleto y no la tabla', () => {
    // Arrange / Act
    renderizar({ cargando: true });

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('el botón de cada fila llama a onResponder con la solicitud de esa fila', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onResponder } = renderizar();
    const tabla = screen.getByRole('table', { name: 'Solicitudes de novedad recibidas' });

    // Act
    await user.click(
      within(tabla).getByRole('button', { name: 'Responder la solicitud de María Torres' }),
    );

    // Assert
    expect(onResponder).toHaveBeenCalledTimes(1);
    expect(onResponder).toHaveBeenCalledWith(SOLICITUDES[1]);
  });
});
