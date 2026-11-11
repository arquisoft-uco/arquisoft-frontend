import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test-utils/render';
import AccionesProyectoGradoAsesor from './AccionesProyectoGradoAsesor';

const { ultimoEntregable, mutar } = vi.hoisted(() => ({
  ultimoEntregable: vi.fn(),
  mutar: vi.fn(),
}));

vi.mock('../../hooks/useUltimoEntregableProyectoGrado', () => ({
  useUltimoEntregableProyectoGrado: ultimoEntregable,
}));
vi.mock('../../hooks/useFinalizarProyectoGrado', () => ({
  useFinalizarProyectoGrado: () => ({ mutate: mutar, isPending: false, reset: vi.fn() }),
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

function consultaCon(parcial: Record<string, unknown>) {
  ultimoEntregable.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    ...parcial,
  });
}

function montar() {
  const onFinalizado = vi.fn();
  render(
    <AccionesProyectoGradoAsesor
      proyectoGradoId="p-1"
      titulo="Sistema"
      onFinalizado={onFinalizado}
    />,
  );
  return { onFinalizado };
}

describe('AccionesProyectoGradoAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin entregables deshabilita el botón y explica el motivo', () => {
    // Arrange
    consultaCon({ data: null });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('button', { name: 'Finalizar proyecto' })).toBeDisabled();
    expect(screen.getByText(/Aún no hay entregables/)).toBeInTheDocument();
  });

  it('con el último entregable en otro estado deshabilita el botón y nombra versión y estado', () => {
    // Arrange
    consultaCon({
      data: { versionEntregable: 2, estadoEntregable: { id: 'APROBADO', nombre: 'Aprobado' } },
    });

    // Act
    montar();

    // Assert
    expect(screen.getByRole('button', { name: 'Finalizar proyecto' })).toBeDisabled();
    expect(screen.getByText(/versión 2.*«Aprobado»/)).toBeInTheDocument();
  });

  it.each(['CERRADO', 'RECHAZADO'])(
    'con el último entregable %s habilita el botón sin aviso',
    (id) => {
      // Arrange
      consultaCon({ data: { versionEntregable: 1, estadoEntregable: { id, nombre: id } } });

      // Act
      montar();

      // Assert
      expect(screen.getByRole('button', { name: 'Finalizar proyecto' })).toBeEnabled();
      expect(screen.queryByText(/Para finalizar debe estar/)).not.toBeInTheDocument();
    },
  );

  it('si la consulta falla deshabilita el botón y «Reintentar» vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    consultaCon({ error: new Error('fallo'), refetch });
    montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Finalizar proyecto' })).toBeDisabled();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('abrir, escribir la frase y confirmar envía la finalización y avisa a onFinalizado', async () => {
    // Arrange
    const user = userEvent.setup();
    mutar.mockImplementation((_req, opciones) => opciones.onSuccess());
    consultaCon({
      data: { versionEntregable: 1, estadoEntregable: { id: 'CERRADO', nombre: 'Cerrado' } },
    });
    const { onFinalizado } = montar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Finalizar proyecto' }));
    const dialogo = within(screen.getByRole('alertdialog'));
    await user.type(dialogo.getByRole('textbox'), 'Finalizar proyecto de grado');
    await user.click(dialogo.getByRole('button', { name: 'Finalizar proyecto' }));

    // Assert
    expect(mutar).toHaveBeenCalledWith({ proyectoGradoId: 'p-1' }, expect.any(Object));
    expect(onFinalizado).toHaveBeenCalledTimes(1);
  });
});
