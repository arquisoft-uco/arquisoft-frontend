import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
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
    destinatario: { usuarioId: 'u-9', identificador: '1001', nombre: 'Ana', email: 'ana@uco.edu.co' },
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
    destinatario: { usuarioId: 'u-9', identificador: '1001', nombre: 'Ana', email: 'ana@uco.edu.co' },
  },
];

function renderizar(parcial: Partial<React.ComponentProps<typeof SolicitudesRecibidasTable>> = {}) {
  const props = {
    solicitudes: SOLICITUDES,
    totalElements: 25,
    totalPages: 3,
    page: 0,
    pageSize: 10,
    onPageChange: vi.fn(),
    onResponder: vi.fn(),
    ...parcial,
  };
  render(<SolicitudesRecibidasTable {...props} />);
  return props;
}

describe('SolicitudesRecibidasTable', () => {
  it('muestra una fila por solicitud con remitente, correo, mensaje y la fecha ISO en <time>', () => {
    renderizar();

    const tabla = screen.getByRole('table', { name: 'Solicitudes de novedad recibidas' });
    const filas = within(tabla).getAllByRole('row');
    expect(filas).toHaveLength(SOLICITUDES.length + 1);
    expect(within(filas[1]).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(filas[1]).getByText(/2001.*luis@uco\.edu\.co/)).toBeInTheDocument();
    expect(within(filas[1]).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(filas[1].querySelector('time')).toHaveAttribute('datetime', FECHA_ISO);
    expect(within(filas[2]).getByText('María Torres')).toBeInTheDocument();
  });

  it('el paginador muestra el rango y llama a onPageChange con la página siguiente', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderizar();

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(screen.getByText('1–2 de 25 solicitudes')).toBeInTheDocument();
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('el botón de cada fila llama a onResponder con la solicitud de esa fila', async () => {
    const user = userEvent.setup();
    const { onResponder } = renderizar();

    await user.click(screen.getByRole('button', { name: 'Responder la solicitud de María Torres' }));

    expect(onResponder).toHaveBeenCalledTimes(1);
    expect(onResponder).toHaveBeenCalledWith(SOLICITUDES[1]);
  });
});
