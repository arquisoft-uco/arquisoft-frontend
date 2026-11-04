import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { RESPUESTA_REGISTRO_MODIFICACION_USUARIOS } from '../../../../test-utils/respuestas';
import RespuestasRegistroModificacionUsuariosRecibidasTable from './RespuestasRegistroModificacionUsuariosRecibidasTable';

const ORDEN = { clave: 'fechaRespuesta', direccion: 'DESC' } as const;

function crearProps(parcial: Partial<{ onOrdenar: () => void }> = {}) {
  return {
    cargando: false,
    hayFiltros: false,
    orden: ORDEN,
    onOrdenar: vi.fn(),
    onLimpiarFiltros: vi.fn(),
    ...parcial,
  };
}

describe('RespuestasRegistroModificacionUsuariosRecibidasTable', () => {
  it('muestra el administrador, el mensaje, la respuesta y el estado, y permite ordenar por administrador', async () => {
    // Arrange
    const user = userEvent.setup();
    const onOrdenar = vi.fn();
    render(
      <RespuestasRegistroModificacionUsuariosRecibidasTable
        respuestas={[RESPUESTA_REGISTRO_MODIFICACION_USUARIOS]}
        {...crearProps({ onOrdenar })}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Administrador' }));

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Respuestas de registro y modificación de usuarios recibidas',
    });
    expect(within(tabla).getByText('Ana Coordinadora')).toBeInTheDocument();
    expect(within(tabla).getByText(/1001 · ana@uco.edu.co/)).toBeInTheDocument();
    expect(
      within(tabla).getByText('Solicito el registro de un nuevo usuario en la plataforma.'),
    ).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobamos el registro del usuario.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button', { name: /acciones/i })).not.toBeInTheDocument();
    expect(onOrdenar).toHaveBeenCalledWith('destinatarioNombre', 'ASC');
  });

  it('sin respuestas muestra el vacío que menciona al administrador', () => {
    // Act
    render(
      <RespuestasRegistroModificacionUsuariosRecibidasTable respuestas={[]} {...crearProps()} />,
    );

    // Assert
    expect(screen.getByText('Aún no has recibido respuestas')).toBeInTheDocument();
    expect(screen.getByText(/Cuando el administrador responda/)).toBeInTheDocument();
  });
});
