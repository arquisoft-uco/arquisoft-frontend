import { describe, it, expect } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import type { RespuestaSolicitud } from '../../models/RespuestaSolicitud';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

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
        nombre: 'Ana',
        email: 'ana@uco.edu.co',
      },
    },
  },
];

describe('RespuestasEnviadasTable', () => {
  it('muestra estudiante, mensaje, respuesta y estado de cada fila, sin acciones', () => {
    // Act
    render(<RespuestasEnviadasTable respuestas={RESPUESTAS} cargando={false} />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades enviadas' });
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText(/luis@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('Programemos una reunión.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button')).not.toBeInTheDocument();
  });

  it('sin respuestas muestra el estado vacío', () => {
    // Act
    render(<RespuestasEnviadasTable respuestas={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Aún no has enviado respuestas')).toBeInTheDocument();
  });
});
