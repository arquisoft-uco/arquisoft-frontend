import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils/render';
import type { ProyectoGradoEstudiante } from '../models/ProyectoGradoEstudiante';
import SelectorProyectoGrado from './SelectorProyectoGrado';

function proyecto(id: string, estadoId: string, estadoNombre: string): ProyectoGradoEstudiante {
  return {
    id,
    fichaPerfil: `f-${id}`,
    tituloProyecto: `Proyecto ${id}`,
    estado: { id: estadoId, nombre: estadoNombre },
  };
}

describe('SelectorProyectoGrado', () => {
  it('agrega el estado a la opción solo en proyectos cancelados o finalizados', () => {
    // Act
    render(
      <SelectorProyectoGrado
        proyectos={[
          proyecto('p-1', 'ACTIVO', 'Activo'),
          proyecto('p-2', 'CANCELADO', 'Cancelado'),
          proyecto('p-3', 'FINALIZADO', 'Finalizado'),
        ]}
        proyectoActivoId="p-1"
        onSeleccionar={() => undefined}
      />,
    );

    // Assert
    expect(screen.getByRole('option', { name: 'Proyecto p-1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Proyecto p-2 · Cancelado' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Proyecto p-3 · Finalizado' })).toBeInTheDocument();
  });
});
