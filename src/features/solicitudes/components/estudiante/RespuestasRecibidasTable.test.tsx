import { describe, it, expect } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

const RESPUESTAS: RespuestaSolicitud[] = [
  {
    id: 'r-1',
    contenido: 'Programemos una reunión.',
    fechaRespuesta: '2026-09-02T10:00:00Z',
    estadoRespuestaId: 'APROBADA',
    estadoRespuestaNombre: 'Aprobada',
    solicitud: {
      id: 's-1',
      mensajeSolicitud: 'No he podido contactar a mi asesor.',
      fechaCreacion: '2026-09-01T15:30:00Z',
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
        nombre: 'Ana Coordinadora',
        email: 'ana@uco.edu.co',
      },
    },
  },
];

describe('RespuestasRecibidasTable', () => {
  it('muestra coordinador, mensaje, respuesta y estado de cada fila, sin acciones', () => {
    // Act
    render(<RespuestasRecibidasTable respuestas={RESPUESTAS} cargando={false} />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades recibidas' });
    expect(within(tabla).getByText('Ana Coordinadora')).toBeInTheDocument();
    expect(within(tabla).getByText(/ana@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('Programemos una reunión.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button')).not.toBeInTheDocument();
  });

  it('sin respuestas muestra el estado vacío', () => {
    // Act
    render(<RespuestasRecibidasTable respuestas={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Aún no has recibido respuestas')).toBeInTheDocument();
  });

  it('mientras carga no muestra el estado vacío', () => {
    // Act
    render(<RespuestasRecibidasTable respuestas={[]} cargando />);

    // Assert
    expect(screen.queryByText('Aún no has recibido respuestas')).not.toBeInTheDocument();
  });
});
