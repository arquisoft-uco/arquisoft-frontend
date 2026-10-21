import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';
import { proyectosGradoService } from '../../services/proyectosGradoService';
import { formatearFecha } from '../../utils/formato-fecha';
import AsesoresProyectoGradoPanel from './AsesoresProyectoGradoPanel';

vi.mock('../../services/proyectosGradoService', () => ({
  proyectosGradoService: {
    getAsesoresProyecto: vi.fn(),
    cambiarEstadoAsesor: vi.fn(),
  },
}));

vi.mock('./AsignarAsesorProyectoGradoPanel', () => ({
  default: () => <div role="dialog" aria-label="Panel de asignación" />,
}));

const PROPS = { proyectoGradoId: 'p-1', titulo: 'Proyecto', finalizado: false };

const consultar = vi.mocked(proyectosGradoService.getAsesoresProyecto);
const cambiarEstado = vi.mocked(proyectosGradoService.cambiarEstadoAsesor);

const vigente: AsesorProyectoGrado = {
  id: 'ap-2',
  proyectoGradoId: 'p-1',
  asesorId: 'a-1',
  identificador: '1001',
  nombre: 'Ana Pérez',
  email: 'ana@uco.edu.co',
  estado: { id: 'ASIGNADO', nombre: 'Asignado' },
  fechaAsignado: '2026-03-10T12:00:00Z',
  vigente: true,
  actual: true,
};

const anterior: AsesorProyectoGrado = {
  ...vigente,
  id: 'ap-1',
  estado: { id: 'FINALIZADO', nombre: 'Finalizado' },
  fechaAsignado: '2026-01-05T12:00:00Z',
  actual: false,
};

function crearError422(message: string) {
  return new AxiosError('fallo', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 422,
    statusText: 'Unprocessable',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { message },
  });
}

function tablaDeAsesores() {
  return screen.findByRole('table', { name: 'Asesores del proyecto de grado' });
}

describe('AsesoresProyectoGradoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el historial en el orden del servidor con «Actual» solo en la fila actual', async () => {
    // Arrange
    consultar.mockResolvedValue([vigente, anterior]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const tabla = within(await tablaDeAsesores());

    // Assert
    expect(consultar).toHaveBeenCalledWith('p-1');
    const filas = tabla.getAllByRole('row').slice(1);
    expect(filas).toHaveLength(2);
    expect(within(filas[0]).getByText('Asignado')).toBeInTheDocument();
    expect(within(filas[0]).getByText('Actual')).toBeInTheDocument();
    expect(within(filas[0]).getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(within(filas[0]).getByText('1001')).toBeInTheDocument();
    expect(within(filas[0]).getByText(formatearFecha(vigente.fechaAsignado))).toBeInTheDocument();
    expect(within(filas[1]).getByText('Finalizado')).toBeInTheDocument();
    expect(within(filas[1]).queryByText('Actual')).not.toBeInTheDocument();
  });

  it('con el caso de la captura muestra una sola «Actual», en la primera fila', async () => {
    // Arrange
    const finalizado = { id: 'FINALIZADO', nombre: 'Finalizado' };
    consultar.mockResolvedValue([
      { ...vigente, id: 'ap-4' },
      { ...vigente, id: 'ap-3', estado: finalizado, actual: false },
      { ...vigente, id: 'ap-2', actual: false },
      { ...vigente, id: 'ap-1', asesorId: 'a-2', nombre: 'asesor asesor', estado: finalizado },
    ]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const tabla = within(await tablaDeAsesores());

    // Assert
    expect(tabla.getAllByText('Actual')).toHaveLength(1);
    const filas = tabla.getAllByRole('row').slice(1);
    expect(filas).toHaveLength(4);
    expect(within(filas[0]).getByText('Actual')).toBeInTheDocument();
    expect(within(filas[3]).queryByText('Actual')).not.toBeInTheDocument();
    expect(tabla.queryByText('Último registro')).not.toBeInTheDocument();
    const tarjetas = within(screen.getByRole('list', { name: 'Asesores del proyecto de grado' }));
    expect(tarjetas.getAllByText('Actual')).toHaveLength(1);
    expect(tarjetas.queryByText('Último registro')).not.toBeInTheDocument();
    expect(screen.queryByText('Sin asesor asignado')).not.toBeInTheDocument();
  });

  it('sin asesor asignado marca el último registro en la primera fila y avisa', async () => {
    // Arrange
    const finalizado = { id: 'FINALIZADO', nombre: 'Finalizado' };
    consultar.mockResolvedValue([
      { ...vigente, id: 'ap-3', estado: finalizado, actual: true },
      { ...vigente, id: 'ap-2', actual: false },
      { ...vigente, id: 'ap-1', estado: finalizado, actual: false },
    ]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const tabla = within(await tablaDeAsesores());
    const tarjetas = within(screen.getByRole('list', { name: 'Asesores del proyecto de grado' }));

    // Assert
    expect(tabla.getAllByText('Último registro')).toHaveLength(1);
    expect(tabla.queryByText('Actual')).not.toBeInTheDocument();
    const filas = tabla.getAllByRole('row').slice(1);
    expect(within(filas[0]).getByText('Último registro')).toBeInTheDocument();
    expect(tarjetas.getAllByText('Último registro')).toHaveLength(1);
    expect(tarjetas.queryByText('Actual')).not.toBeInTheDocument();
    const fichas = tarjetas.getAllByRole('listitem');
    expect(fichas).toHaveLength(3);
    expect(within(fichas[0]).getByText('Último registro')).toBeInTheDocument();
    expect(screen.getByText('Sin asesor asignado')).toBeInTheDocument();
    expect(
      screen.getByText(/El último registro es de Ana Pérez \(finalizado\)/),
    ).toBeInTheDocument();
  });

  it('sin historial no muestra aviso de asesor', async () => {
    // Arrange
    consultar.mockResolvedValue([]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    await screen.findByText('Este proyecto aún no tiene asesores');

    // Assert
    expect(screen.queryByText('Sin asesor asignado')).not.toBeInTheDocument();
  });

  it('marca «Dado de baja» solo en el asesor con vigente = false', async () => {
    // Arrange
    consultar.mockResolvedValue([vigente, { ...anterior, vigente: false }]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const filas = within(await tablaDeAsesores())
      .getAllByRole('row')
      .slice(1);

    // Assert
    expect(within(filas[0]).queryByText('Dado de baja')).not.toBeInTheDocument();
    expect(within(filas[1]).getByText('Dado de baja')).toBeInTheDocument();
  });

  it('muestra el estado de carga mientras consulta', () => {
    // Arrange
    consultar.mockReturnValue(new Promise(() => {}));

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el vacío, sin error, cuando el proyecto no tiene asesores', async () => {
    // Arrange
    consultar.mockResolvedValue([]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);

    // Assert
    expect(await screen.findByText('Este proyecto aún no tiene asesores')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra el mensaje del backend y vuelve a consultar al reintentar', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockRejectedValueOnce(crearError422('El proyecto no pertenece al coordinador'));
    consultar.mockResolvedValueOnce([vigente]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const alerta = await screen.findByRole('alert');
    expect(within(alerta).getByText('No se pudieron cargar los asesores')).toBeInTheDocument();
    expect(within(alerta).getByText('El proyecto no pertenece al coordinador')).toBeInTheDocument();
    await user.click(within(alerta).getByRole('button', { name: 'Reintentar' }));

    // Assert
    await waitFor(() => expect(consultar).toHaveBeenCalledTimes(2));
    expect(await tablaDeAsesores()).toBeInTheDocument();
  });

  it('muestra «Asignar asesor» con la lista cargada, incluso vacía, y abre el panel', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue([]);

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    await user.click(await screen.findByRole('button', { name: 'Asignar asesor' }));

    // Assert
    expect(screen.getByRole('dialog', { name: 'Panel de asignación' })).toBeInTheDocument();
  });

  it('no muestra «Asignar asesor» mientras carga ni cuando la consulta falla', async () => {
    // Arrange
    consultar.mockReturnValueOnce(new Promise(() => {}));

    // Act
    const { unmount } = render(<AsesoresProyectoGradoPanel {...PROPS} />);

    // Assert
    expect(screen.queryByRole('button', { name: 'Asignar asesor' })).not.toBeInTheDocument();
    unmount();

    // Arrange
    consultar.mockRejectedValueOnce(crearError422('fallo'));

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    await screen.findByRole('alert');

    // Assert
    expect(screen.queryByRole('button', { name: 'Asignar asesor' })).not.toBeInTheDocument();
  });

  it('solo la fila vigente ASIGNADO ofrece «Finalizar participación»; con el proyecto finalizado ninguna', async () => {
    // Arrange
    consultar.mockResolvedValue([vigente, { ...vigente, id: 'ap-0', actual: false }, anterior]);

    // Act
    const { unmount } = render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const filas = within(await tablaDeAsesores())
      .getAllByRole('row')
      .slice(1);

    // Assert
    expect(within(filas[0]).getByRole('button', { name: 'Acciones de Ana Pérez' })).toBeVisible();
    expect(within(filas[1]).queryByRole('button')).not.toBeInTheDocument();
    expect(within(filas[2]).queryByRole('button')).not.toBeInTheDocument();
    unmount();

    // Act
    render(<AsesoresProyectoGradoPanel {...PROPS} finalizado />);
    await tablaDeAsesores();

    // Assert
    expect(screen.queryByRole('button', { name: /Acciones de/ })).not.toBeInTheDocument();
  });

  it('cancelar el diálogo no envía la finalización', async () => {
    // Arrange
    const user = userEvent.setup();
    consultar.mockResolvedValue([vigente]);
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const tabla = within(await tablaDeAsesores());

    // Act
    await user.click(tabla.getByRole('button', { name: 'Acciones de Ana Pérez' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Finalizar participación' }));
    const dialogo = await screen.findByRole('alertdialog');
    expect(within(dialogo).getByText(/Ana Pérez dejará de ser asesor/)).toBeInTheDocument();
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(cambiarEstado).not.toHaveBeenCalled();
  });

  it('confirmar finaliza por el asesorId de la fila, no por su id, y cierra el diálogo', async () => {
    // Arrange
    const user = userEvent.setup();
    cambiarEstado.mockResolvedValue(undefined);
    consultar.mockResolvedValue([vigente]);
    render(<AsesoresProyectoGradoPanel {...PROPS} />);
    const tabla = within(await tablaDeAsesores());

    // Act
    await user.click(tabla.getByRole('button', { name: 'Acciones de Ana Pérez' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Finalizar participación' }));
    const dialogo = await screen.findByRole('alertdialog');
    await user.click(within(dialogo).getByRole('button', { name: 'Finalizar participación' }));

    // Assert
    await waitFor(() =>
      expect(cambiarEstado).toHaveBeenCalledWith({
        proyectoGradoId: 'p-1',
        asesorId: 'a-1',
        estadoAsesorId: 'FINALIZADO',
      }),
    );
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
});
