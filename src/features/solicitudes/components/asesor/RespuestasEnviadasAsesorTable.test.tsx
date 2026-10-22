import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import { RESPUESTA } from '../../../../test-utils/respuestas';
import RespuestasEnviadasAsesorTable from './RespuestasEnviadasAsesorTable';

const ORDEN = { clave: 'fechaRespuesta', direccion: 'DESC' } as const;

describe('RespuestasEnviadasAsesorTable', () => {
  it('muestra estudiante, mensaje, respuesta y estado de cada fila, sin acciones', () => {
    // Act
    render(
      <RespuestasEnviadasAsesorTable
        respuestas={[RESPUESTA]}
        cargando={false}
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />,
    );

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades enviadas' });
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText(/luis@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('Programemos una reunión.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button', { name: /acciones/i })).not.toBeInTheDocument();
  });

  it('con acciones las renderiza por fila bajo la columna Acciones', () => {
    // Act
    render(
      <RespuestasEnviadasAsesorTable
        respuestas={[RESPUESTA]}
        cargando={false}
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={vi.fn()}
        onLimpiarFiltros={vi.fn()}
        acciones={(respuesta) => <button type="button">Acción {respuesta.id}</button>}
      />,
    );

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades enviadas' });
    expect(within(tabla).getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
    expect(within(tabla).getByRole('button', { name: 'Acción r-1' })).toBeInTheDocument();
  });

  it('sin respuestas muestra el estado vacío', () => {
    // Act
    render(
      <RespuestasEnviadasAsesorTable
        respuestas={[]}
        cargando={false}
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={vi.fn()}
        onLimpiarFiltros={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('Aún no has enviado respuestas')).toBeInTheDocument();
  });

  it('solo la fecha es ordenable: Estudiante no tiene botón de orden', async () => {
    // Arrange
    const user = userEvent.setup();
    const onOrdenar = vi.fn();
    render(
      <RespuestasEnviadasAsesorTable
        respuestas={[RESPUESTA]}
        cargando={false}
        hayFiltros={false}
        orden={ORDEN}
        onOrdenar={onOrdenar}
        onLimpiarFiltros={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Respondida' }));

    // Assert
    expect(screen.queryByRole('button', { name: 'Estudiante' })).not.toBeInTheDocument();
    expect(onOrdenar).toHaveBeenCalledWith('fechaRespuesta', 'ASC');
  });

  it('sin coincidencias con filtros muestra Sin resultados y Limpiar filtros los limpia', async () => {
    // Arrange
    const user = userEvent.setup();
    const onLimpiarFiltros = vi.fn();
    render(
      <RespuestasEnviadasAsesorTable
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
    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1);
  });
});
