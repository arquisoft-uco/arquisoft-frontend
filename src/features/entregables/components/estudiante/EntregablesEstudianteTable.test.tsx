import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import EntregablesEstudianteTable from './EntregablesEstudianteTable';
import type { EntregableProyectoGrado } from '../../models/EntregableProyectoGrado';

const ENTREGABLE_1: EntregableProyectoGrado = {
  id: 'e-1',
  versionEntregable: 2,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
  proyectoFinalizado: false,
  proyectoCancelado: false,
};
const ENTREGABLE_2: EntregableProyectoGrado = {
  id: 'e-2',
  versionEntregable: 1,
  proyectoGrado: { id: 'p-1', nombre: 'Sistema de riego' },
  asesor: { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' },
  estadoEntregable: { id: 'EN_EVALUACION', nombre: 'En evaluación' },
  proyectoFinalizado: false,
  proyectoCancelado: false,
};

function renderizar(
  parcial: Partial<React.ComponentProps<typeof EntregablesEstudianteTable>> = {},
) {
  const props = {
    entregables: [ENTREGABLE_1, ENTREGABLE_2],
    cargando: false,
    estadoProyecto: 'activos' as const,
    orden: { clave: 'versionEntregable', direccion: 'DESC' as const },
    onOrdenar: vi.fn(),
    onDescargarPaquete: vi.fn(),
    descargando: false,
    ...parcial,
  };
  render(<EntregablesEstudianteTable {...props} />);
  return props;
}

// jsdom no aplica CSS: la tabla y las tarjetas están las dos en el DOM, se acota a la tabla.
function tabla() {
  return within(screen.getByRole('table', { name: 'Entregables' }));
}

describe('EntregablesEstudianteTable', () => {
  it('muestra versión, asesor y estado de cada entregable', () => {
    // Act
    renderizar();

    // Assert
    expect(tabla().getByText('Versión 2')).toBeInTheDocument();
    expect(tabla().getByText('Ana Pérez')).toBeInTheDocument();
    expect(tabla().getByText('Aprobado')).toBeInTheDocument();
    expect(tabla().getByText('Luis Gómez')).toBeInTheDocument();
    expect(tabla().getByText('En evaluación')).toBeInTheDocument();
  });

  it('ordena por Versión y por Asesor, y Estado no es ordenable', async () => {
    // Arrange
    const user = userEvent.setup();
    const { onOrdenar } = renderizar();

    // Act
    await user.click(tabla().getByRole('button', { name: 'Versión' }));
    await user.click(tabla().getByRole('button', { name: 'Asesor' }));

    // Assert
    expect(onOrdenar).toHaveBeenNthCalledWith(1, 'versionEntregable', 'ASC');
    expect(onOrdenar).toHaveBeenNthCalledWith(2, 'asesorNombre', 'ASC');
    expect(tabla().queryByRole('button', { name: 'Estado' })).not.toBeInTheDocument();
  });

  it('sin entregables muestra el vacío del estudiante', () => {
    // Act
    renderizar({ entregables: [] });

    // Assert
    expect(screen.getByText('Aún no hay entregables en tu proyecto')).toBeInTheDocument();
  });

  it('el menú de la fila descarga el paquete y en un proyecto finalizado solo del entregable cerrado', async () => {
    // Arrange
    const user = userEvent.setup();
    const cerrado: EntregableProyectoGrado = {
      ...ENTREGABLE_1,
      estadoEntregable: { id: 'CERRADO', nombre: 'Cerrado' },
      proyectoFinalizado: true,
    };
    const aprobado: EntregableProyectoGrado = {
      ...ENTREGABLE_2,
      estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' },
      proyectoFinalizado: true,
    };
    const { onDescargarPaquete } = renderizar({
      entregables: [cerrado, aprobado],
      estadoProyecto: 'finalizados',
    });

    // Act
    await user.click(tabla().getByRole('button', { name: 'Acciones del entregable versión 2' }));
    await user.click(screen.getByRole('menuitem', { name: 'Descargar paquete' }));
    await user.click(tabla().getByRole('button', { name: 'Acciones del entregable versión 1' }));

    // Assert
    expect(tabla().getAllByText('Proyecto finalizado')).toHaveLength(2);
    expect(onDescargarPaquete).toHaveBeenCalledWith(cerrado);
    expect(screen.getByRole('menuitem', { name: 'Descargar paquete' })).toBeDisabled();
  });

  it('con "Finalizados" y sin entregables muestra el vacío propio del alcance', () => {
    // Act
    renderizar({ entregables: [], estadoProyecto: 'finalizados' });

    // Assert
    expect(screen.getByText('Sin entregables de proyectos finalizados')).toBeInTheDocument();
  });
});
