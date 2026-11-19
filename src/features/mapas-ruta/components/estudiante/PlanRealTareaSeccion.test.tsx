import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import type { ConsultaPlanReal } from '../../hooks/usePlanRealTarea';
import PlanRealTareaSeccion from './PlanRealTareaSeccion';

const PLAN = { id: 'r-1', tareaId: 't-1', tiempoRealDias: 4, descripcionReal: 'Informe entregado' };

function consulta(parcial: Partial<ConsultaPlanReal> = {}): ConsultaPlanReal {
  return {
    plan: undefined,
    cargando: false,
    hayError: false,
    reintentar: vi.fn(),
    ...parcial,
  };
}

describe('PlanRealTareaSeccion', () => {
  it('mientras carga expone el estado de carga accesible', () => {
    // Arrange / Act
    render(
      <PlanRealTareaSeccion
        onEditar={vi.fn()}
        onRemover={vi.fn()}
        consulta={consulta({ cargando: true })}
      />,
    );

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('con plan muestra los días y la descripción', () => {
    // Arrange / Act
    render(
      <PlanRealTareaSeccion
        onEditar={vi.fn()}
        onRemover={vi.fn()}
        consulta={consulta({ plan: PLAN })}
      />,
    );

    // Assert
    expect(screen.getByRole('heading', { name: 'Plan real' })).toBeInTheDocument();
    expect(screen.getByText('4 días')).toBeInTheDocument();
    expect(screen.getByText('Informe entregado')).toBeInTheDocument();
  });

  it('con plan ofrece Editar plan real y dispara onEditar', async () => {
    // Arrange
    const onEditar = vi.fn();
    const user = userEvent.setup();
    render(
      <PlanRealTareaSeccion
        onEditar={onEditar}
        onRemover={vi.fn()}
        consulta={consulta({ plan: PLAN })}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Editar plan real' }));

    // Assert
    expect(onEditar).toHaveBeenCalledTimes(1);
  });

  it('con plan ofrece Remover plan real y dispara onRemover', async () => {
    // Arrange
    const onRemover = vi.fn();
    const user = userEvent.setup();
    render(
      <PlanRealTareaSeccion
        onEditar={vi.fn()}
        onRemover={onRemover}
        consulta={consulta({ plan: PLAN })}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: 'Remover plan real' }));

    // Assert
    expect(onRemover).toHaveBeenCalledTimes(1);
  });

  it('con descripción nula muestra «Sin descripción»', () => {
    // Arrange / Act
    render(
      <PlanRealTareaSeccion
        onEditar={vi.fn()}
        onRemover={vi.fn()}
        consulta={consulta({ plan: { ...PLAN, tiempoRealDias: 1, descripcionReal: null } })}
      />,
    );

    // Assert
    expect(screen.getByText('1 día')).toBeInTheDocument();
    expect(screen.getByText('Sin descripción')).toBeInTheDocument();
  });

  it('sin plan muestra el vacío y ningún botón', () => {
    // Arrange / Act
    render(<PlanRealTareaSeccion onEditar={vi.fn()} onRemover={vi.fn()} consulta={consulta()} />);

    // Assert
    expect(screen.getByText('Esta tarea aún no tiene plan real')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Editar plan real' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remover plan real' })).not.toBeInTheDocument();
  });

  it('con error muestra el aviso y Reintentar vuelve a consultar', async () => {
    // Arrange
    const reintentar = vi.fn();
    const user = userEvent.setup();
    render(
      <PlanRealTareaSeccion
        onEditar={vi.fn()}
        onRemover={vi.fn()}
        consulta={consulta({ hayError: true, reintentar })}
      />,
    );

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(reintentar).toHaveBeenCalled();
  });
});
