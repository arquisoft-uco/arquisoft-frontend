import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { ConsultaPlanEstimado } from '../../hooks/usePlanEstimadoTarea';
import PlanEstimadoTareaSeccion from './PlanEstimadoTareaSeccion';

const PLAN = {
  id: 'p-1',
  tareaId: 't-1',
  tiempoEstimadoDias: 5,
  descripcionEstimado: 'Redactar el borrador',
};

function consulta(parcial: Partial<ConsultaPlanEstimado> = {}): ConsultaPlanEstimado {
  return {
    plan: undefined,
    cargando: false,
    hayError: false,
    reintentar: vi.fn(),
    puedeAgregar: false,
    ...parcial,
  };
}

describe('PlanEstimadoTareaSeccion', () => {
  it('mientras carga expone el estado de carga accesible', () => {
    // Arrange / Act
    render(
      <PlanEstimadoTareaSeccion consulta={consulta({ cargando: true })} onAgregar={vi.fn()} />,
    );

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con plan muestra los días y la descripción', () => {
    // Arrange / Act
    render(<PlanEstimadoTareaSeccion consulta={consulta({ plan: PLAN })} onAgregar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('heading', { name: 'Plan estimado' })).toBeInTheDocument();
    expect(screen.getByText('5 días')).toBeInTheDocument();
    expect(screen.getByText('Redactar el borrador')).toBeInTheDocument();
  });

  it('con descripción nula muestra «Sin descripción»', () => {
    // Arrange / Act
    render(
      <PlanEstimadoTareaSeccion
        consulta={consulta({ plan: { ...PLAN, tiempoEstimadoDias: 1, descripcionEstimado: null } })}
        onAgregar={vi.fn()}
      />,
    );

    // Assert
    expect(screen.getByText('1 día')).toBeInTheDocument();
    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
  });

  it('sin plan ofrece Agregar plan estimado', async () => {
    // Arrange
    const onAgregar = vi.fn();
    const user = userEvent.setup();
    render(
      <PlanEstimadoTareaSeccion
        consulta={consulta({ puedeAgregar: true })}
        onAgregar={onAgregar}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Agregar plan estimado' }));

    // Assert
    expect(screen.getByText('Esta tarea aún no tiene plan estimado')).toBeInTheDocument();
    expect(onAgregar).toHaveBeenCalled();
  });

  it('con error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    const reintentar = vi.fn();
    const user = userEvent.setup();
    render(
      <PlanEstimadoTareaSeccion
        consulta={consulta({ hayError: true, reintentar })}
        onAgregar={vi.fn()}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(reintentar).toHaveBeenCalled();
  });
});
