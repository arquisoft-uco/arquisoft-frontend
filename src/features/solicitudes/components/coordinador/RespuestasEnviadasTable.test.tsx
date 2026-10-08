import { describe, it, expect } from 'vitest';
import { render, screen, within } from '../../../../test-utils/render';
import { RESPUESTA } from '../../../../test-utils/respuestas';
import RespuestasEnviadasTable from './RespuestasEnviadasTable';

describe('RespuestasEnviadasTable', () => {
  it('muestra estudiante, mensaje, respuesta y estado de cada fila, sin acciones', () => {
    // Act
    render(<RespuestasEnviadasTable respuestas={[RESPUESTA]} cargando={false} />);

    // Assert
    const tabla = screen.getByRole('table', { name: 'Respuestas de novedades enviadas' });
    expect(within(tabla).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(tabla).getByText(/luis@uco.edu.co/)).toBeInTheDocument();
    expect(within(tabla).getByText('No he podido contactar a mi asesor.')).toBeInTheDocument();
    expect(within(tabla).getByText('Programemos una reunión.')).toBeInTheDocument();
    expect(within(tabla).getByText('Aprobada')).toBeInTheDocument();
    expect(within(tabla).queryByRole('button')).not.toBeInTheDocument();
  });

  it('con acciones las renderiza por fila bajo la columna Acciones', () => {
    // Act
    render(
      <RespuestasEnviadasTable
        respuestas={[RESPUESTA]}
        cargando={false}
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
    render(<RespuestasEnviadasTable respuestas={[]} cargando={false} />);

    // Assert
    expect(screen.getByText('Aún no has enviado respuestas')).toBeInTheDocument();
  });
});
