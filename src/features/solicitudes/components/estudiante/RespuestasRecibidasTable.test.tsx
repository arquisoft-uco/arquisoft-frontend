import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import {
  RESPUESTA,
  RESPUESTA_ASESOR,
  RESPUESTA_CAMBIO_ASESOR,
} from '../../../../test-utils/respuestas';
import RespuestasRecibidasTable from './RespuestasRecibidasTable';

const ORDEN = { clave: 'fechaRespuesta', direccion: 'DESC' } as const;

describe('RespuestasRecibidasTable', () => {
  it('muestra coordinador, mensaje, respuesta y estado de cada fila, sin acciones', () => {
    // Act
    render(
      <RespuestasRecibidasTable
        tipo="coordinador"
        respuestas={[RESPUESTA]}
        cargando={false}
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />,
    );

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades recibidas' });
    expect(within(tabla).getByText('Ana Coordinadora')).toBeInTheDocument();
    expect(within(tabla).getByText(/ana@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('Programemos una reunión.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button', { name: /acciones/i })).not.toBeInTheDocument();
  });

  it('sin respuestas muestra el estado vacío', () => {
    // Act
    render(
      <RespuestasRecibidasTable
        tipo="coordinador"
        respuestas={[]}
        cargando={false}
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Aún no has recibido respuestas')).toBeInTheDocument();
  });

  it('mientras carga no muestra el estado vacío', () => {
    // Act
    render(
      <RespuestasRecibidasTable
        tipo="coordinador"
        respuestas={[]}
        cargando
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />,
    );

    // Assert
    expect(screen.queryByText('Aún no has recibido respuestas')).not.toBeInTheDocument();
  });
  it('ordena por coordinador y por fecha desde la cabecera', async () => {
    // Arrange
    const user = userEvent.setup();
    const onOrdenar = vi.fn();
    render(
      <RespuestasRecibidasTable
        tipo="coordinador"
        respuestas={[RESPUESTA]}
        cargando={false}
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={onOrdenar}
        onLimpiarFiltros={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Coordinador' }));
    await user.click(screen.getByRole('button', { name: 'Recibida' }));

    // Assert
    expect(onOrdenar).toHaveBeenNthCalledWith(1, 'destinatarioNombre', 'ASC');
    expect(onOrdenar).toHaveBeenNthCalledWith(2, 'fechaRespuesta', 'ASC');
  });

  it('sin coincidencias con filtros muestra Sin resultados y Limpiar filtros los limpia', async () => {
    // Arrange
    const user = userEvent.setup();
    const onLimpiarFiltros = vi.fn();
    render(
      <RespuestasRecibidasTable
        tipo="coordinador"
        respuestas={[]}
        cargando={false}
        hayFiltros
        orden={ORDEN}
        onOrdenar={vi.fn()}
        onLimpiarFiltros={onLimpiarFiltros}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.queryByText('Aún no has recibido respuestas')).not.toBeInTheDocument();
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });

  it('con tipo asesor muestra el asesor que respondió, su encabezado y el vacío propio', () => {
    // Arrange
    const props = {
      cargando: false,
      hayFiltros: false,
      orden: ORDEN,
      onOrdenar: vi.fn(),
      onLimpiarFiltros: vi.fn(),
    };

    // Act
    const { rerender } = render(
      <RespuestasRecibidasTable tipo="asesor" respuestas={[RESPUESTA_ASESOR]} {...props} />,
    );

    // Assert
    const tabla = screen.getByRole('table', {
      name: 'Respuestas de novedades del asesor recibidas',
    });
    expect(within(tabla).getByRole('button', { name: 'Asesor' })).toBeInTheDocument();
    expect(within(tabla).getByText('Pedro Asesor')).toBeInTheDocument();
    expect(within(tabla).getByText(/pedro@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('Nos vemos el lunes en mi oficina.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();

    // Act
    rerender(<RespuestasRecibidasTable tipo="asesor" respuestas={[]} {...props} />);

    // Assert
    expect(screen.getByText('Aún no has recibido respuestas')).toBeInTheDocument();
    expect(screen.getByText(/Cuando tu asesor responda/)).toBeInTheDocument();
  });

  it('con tipo cambio-asesor muestra el coordinador que respondió, su encabezado y el vacío propio', () => {
    // Arrange
    const props = {
      cargando: false,
      hayFiltros: false,
      orden: ORDEN,
      onOrdenar: vi.fn(),
      onLimpiarFiltros: vi.fn(),
    };

    // Act
    const { rerender } = render(
      <RespuestasRecibidasTable
        tipo="cambio-asesor"
        respuestas={[RESPUESTA_CAMBIO_ASESOR]}
        {...props}
      />,
    );

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de cambio de asesor recibidas' });
    expect(within(tabla).getByRole('button', { name: 'Coordinador' })).toBeInTheDocument();
    expect(within(tabla).getByText('Ana Coordinadora')).toBeInTheDocument();
    expect(within(tabla).getByText(/ana@uco.edu.co/)).toBeInTheDocument();
    expect(
      within(tabla).getByText('Quiero cambiar de asesor por incompatibilidad de horarios.'),
    ).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobamos el cambio de asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();

    // Act
    rerender(<RespuestasRecibidasTable tipo="cambio-asesor" respuestas={[]} {...props} />);

    // Assert
    expect(screen.getByText('Aún no has recibido respuestas')).toBeInTheDocument();
    expect(screen.getByText(/Cuando el coordinador responda/)).toBeInTheDocument();
  });
});
