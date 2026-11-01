import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { EstudianteArtefacto } from '../../models/EstudianteArtefacto';
import { toast } from '../../../../shared/hooks/useToast';
import { useEstudiantesArtefacto } from '../../hooks/useEstudiantesArtefacto';
import { useRemoverEstudianteArtefacto } from '../../hooks/useRemoverEstudianteArtefacto';
import EstudiantesArtefactoLista from './EstudiantesArtefactoLista';

vi.mock('../../hooks/useEstudiantesArtefacto', () => ({
  useEstudiantesArtefacto: vi.fn(),
}));

vi.mock('../../hooks/useRemoverEstudianteArtefacto', () => ({
  useRemoverEstudianteArtefacto: vi.fn(),
}));

vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const hook = vi.mocked(useEstudiantesArtefacto);
const hookQuitar = vi.mocked(useRemoverEstudianteArtefacto);

type Quitar = ReturnType<typeof useRemoverEstudianteArtefacto>;

function quitarMock(parcial: Partial<Quitar> = {}) {
  const mutate = vi.fn();
  const base: Partial<Quitar> = { mutate, isPending: false, variables: undefined };
  hookQuitar.mockReturnValue(Object.assign(base, parcial) as Quitar);
  return mutate;
}

type Resultado = ReturnType<typeof useEstudiantesArtefacto>;

function estado(parcial: Partial<Resultado>): Resultado {
  const base: Partial<Resultado> = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  return Object.assign(base, parcial) as Resultado;
}

const vigente: EstudianteArtefacto = {
  id: 'ea-1',
  artefactoId: 'a-1',
  estudianteId: 'e-1',
  identificador: '2001',
  nombre: 'Luis Gómez',
  email: 'luis@uco.edu.co',
  vigente: true,
};

const dadoDeBaja: EstudianteArtefacto = {
  ...vigente,
  id: 'ea-2',
  estudianteId: 'e-2',
  identificador: '2002',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  vigente: false,
};

describe('EstudiantesArtefactoLista', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    quitarMock();
  });

  it('muestra el estado de carga accesible mientras consulta', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);

    // Assert
    expect(hook).toHaveBeenCalledWith('a-1');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lista nombre, identificador y correo, y marca solo al estudiante no vigente', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [vigente, dadoDeBaja] }));

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Estudiantes del artefacto' });
    const items = within(lista).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(items[0]).getByText('2001')).toBeInTheDocument();
    expect(within(items[0]).getByText('luis@uco.edu.co')).toBeInTheDocument();
    expect(within(items[0]).queryByText('No vigente')).not.toBeInTheDocument();
    expect(within(items[1]).getByText('Ana Pérez')).toBeInTheDocument();
    expect(within(items[1]).getByText('No vigente')).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío y no un error cuando no hay vínculos', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: [] }));

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);

    // Assert
    expect(screen.getByText('Este artefacto no tiene estudiantes vinculados')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el error y reintenta la consulta al pulsar Reintentar', async () => {
    // Arrange
    const refetch = vi.fn();
    hook.mockReturnValue(estado({ isError: true, error: new Error('Sin conexión'), refetch }));
    const user = userEvent.setup();

    // Act
    render(<EstudiantesArtefactoLista artefactoId="a-1" />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('No pudimos cargar los estudiantes del artefacto')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  describe('quitar un estudiante', () => {
    async function abrirDialogo(nombre: string) {
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: `Acciones de ${nombre}` }));
      await user.click(await screen.findByRole('menuitem', { name: 'Quitar estudiante' }));
      return { user, dialogo: await screen.findByRole('alertdialog') };
    }

    it('pide confirmación con el nombre del estudiante y cancelar no llama a la mutación', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [vigente, dadoDeBaja] }));
      const mutate = quitarMock();
      render(<EstudiantesArtefactoLista artefactoId="a-1" />);

      // Act
      const { user, dialogo } = await abrirDialogo('Ana Pérez');
      const nombreDialogo = dialogo.getAttribute('aria-labelledby');
      const titulo = nombreDialogo ? document.getElementById(nombreDialogo)?.textContent : null;
      await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

      // Assert
      expect(titulo).toBe('¿Quitar a Ana Pérez del artefacto?');
      expect(mutate).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    });

    it('al confirmar manda artefactoId y estudianteId (no el id del vínculo), avisa y cierra el diálogo', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [vigente] }));
      const mutate = quitarMock();
      mutate.mockImplementation((_req, opciones) => opciones.onSuccess());
      render(<EstudiantesArtefactoLista artefactoId="a-1" />);

      // Act
      const { user, dialogo } = await abrirDialogo('Luis Gómez');
      await user.click(within(dialogo).getByRole('button', { name: 'Quitar estudiante' }));

      // Assert
      expect(mutate.mock.calls[0][0]).toEqual({ artefactoId: 'a-1', estudianteId: 'e-1' });
      expect(toast.success).toHaveBeenCalledWith('Estudiante quitado', expect.any(String));
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    });

    it('si falla muestra el toast de error con el mensaje del servidor y cierra el diálogo', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [vigente] }));
      const mutate = quitarMock();
      mutate.mockImplementation((_req, opciones) =>
        opciones.onError({
          isAxiosError: true,
          response: { status: 422, data: { message: 'El estudiante no está vinculado' } },
        }),
      );
      render(<EstudiantesArtefactoLista artefactoId="a-1" />);

      // Act
      const { user, dialogo } = await abrirDialogo('Luis Gómez');
      await user.click(within(dialogo).getByRole('button', { name: 'Quitar estudiante' }));

      // Assert
      expect(toast.error).toHaveBeenCalledWith(
        'No se pudo quitar al estudiante',
        'El estudiante no está vinculado',
      );
      expect(toast.success).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    });

    it('deshabilita la acción solo de la fila cuyo estudiante se está quitando', async () => {
      // Arrange
      hook.mockReturnValue(estado({ data: [vigente, dadoDeBaja] }));
      quitarMock({ isPending: true, variables: { artefactoId: 'a-1', estudianteId: 'e-1' } });
      const user = userEvent.setup();
      render(<EstudiantesArtefactoLista artefactoId="a-1" />);

      // Act
      await user.click(screen.getByRole('button', { name: 'Acciones de Luis Gómez' }));
      const enPendiente = await screen.findByRole('menuitem', { name: 'Quitar estudiante' });
      const disabledPendiente =
        enPendiente.hasAttribute('disabled') ||
        enPendiente.getAttribute('aria-disabled') === 'true';
      await user.keyboard('{Escape}');
      await user.click(screen.getByRole('button', { name: 'Acciones de Ana Pérez' }));
      const enOtra = await screen.findByRole('menuitem', { name: 'Quitar estudiante' });

      // Assert
      expect(disabledPendiente).toBe(true);
      expect(enOtra).not.toBeDisabled();
    });
  });
});
