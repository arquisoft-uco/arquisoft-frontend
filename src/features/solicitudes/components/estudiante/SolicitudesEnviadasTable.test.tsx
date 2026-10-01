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
    remitente: { usuarioId: 'u-1', identificador: '2001', nombre: 'Luis', email: 'luis@uco.edu.co' },
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
    remitente: { usuarioId: 'u-1', identificador: '2001', nombre: 'Luis', email: 'luis@uco.edu.co' },
    destinatario: {
      usuarioId: 'u-3',
      identificador: '1002',
      nombre: 'Carlos Ruiz',
      email: 'carlos@uco.edu.co',
    },
  },
];

function renderizar(parcial: Partial<React.ComponentProps<typeof SolicitudesEnviadasTable>> = {}) {
  const props = {
    solicitudes: SOLICITUDES,
    totalElements: 25,
    totalPages: 3,
    page: 0,
    pageSize: 10,
    eliminando: false,
    onPageChange: vi.fn(),
    onEliminar: vi.fn(),
    ...parcial,
  };
  render(<SolicitudesEnviadasTable {...props} />);
  return props;
}

describe('SolicitudesEnviadasTable', () => {
  it('muestra una fila por solicitud con destinatario, correo, mensaje y la fecha ISO en <time>', () => {
    renderizar();

    const tabla = screen.getByRole('table', {
      name: 'Solicitudes de novedad enviadas al coordinador',
    });
    const filas = within(tabla).getAllByRole('row');
    expect(filas).toHaveLength(SOLICITUDES.length + 1);
    expect(within(filas[1]).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(filas[1]).getByText(/1001.*ana@uco\.edu\.co/)).toBeInTheDocument();
    expect(within(filas[1]).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(filas[1].querySelector('time')).toHaveAttribute('datetime', FECHA_ISO);
    expect(within(filas[2]).getByText('Carlos Ruiz')).toBeInTheDocument();
  });

  it('el paginador muestra el rango y llama a onPageChange con la página siguiente', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderizar();

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(screen.getByText('1–2 de 25 solicitudes')).toBeInTheDocument();
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('el botón de eliminar de una fila llama a onEliminar con esa solicitud', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onEliminar } = renderizar();

    // Act
    await user.click(
      screen.getByRole('button', { name: 'Eliminar la solicitud enviada a Carlos Ruiz' }),
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
      screen.getByRole('button', { name: 'Eliminar la solicitud enviada a Ana Pérez' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Eliminar la solicitud enviada a Carlos Ruiz' }),
    ).toBeDisabled();
  });
});
