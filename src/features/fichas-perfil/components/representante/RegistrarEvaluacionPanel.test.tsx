import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '../../../../test-utils/render';
import type { EvaluacionFichaPerfil } from '../../models/fichas-perfil';
import { fichasPerfilService } from '../../services/fichasPerfilService';
import { toast } from '../../../../shared/hooks/useToast';
import RegistrarEvaluacionPanel from './RegistrarEvaluacionPanel';

vi.mock('../../services/fichasPerfilService', () => ({
  fichasPerfilService: { getEvaluacionFicha: vi.fn(), registrarEvaluacion: vi.fn() },
}));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('./EstadosEvaluacionPanel', () => ({ default: () => <div>Catálogo de estados</div> }));
vi.mock('./AgregarEstadoEvaluacionPanel', () => ({
  default: () => <div>Agregar estado</div>,
}));

const getEvaluacionFicha = vi.mocked(fichasPerfilService.getEvaluacionFicha);
const registrarEvaluacion = vi.mocked(fichasPerfilService.registrarEvaluacion);

const EVALUACION: EvaluacionFichaPerfil = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  fechaCreacion: '2026-09-01T10:00:00',
  estadoEvaluacionId: 'st-1',
  estadoEvaluacionNombre: 'En revisión',
};

describe('RegistrarEvaluacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el indicador de carga mientras consulta la evaluación', () => {
    // Arrange
    getEvaluacionFicha.mockReturnValue(new Promise(() => undefined));

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando evaluación...');
  });

  it('muestra una alerta cuando la consulta falla', async () => {
    // Arrange
    getEvaluacionFicha.mockRejectedValue(new Error('500'));

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo cargar la evaluación. Intenta nuevamente.',
    );
  });

  it('registra la evaluación al confirmar y lanza el toast de éxito', async () => {
    // Arrange
    const user = userEvent.setup();
    getEvaluacionFicha.mockResolvedValue([]);
    registrarEvaluacion.mockResolvedValue({ id: 'ev-1' });
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(await screen.findByRole('button', { name: 'Iniciar evaluación' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar evaluación' }),
    );

    // Assert
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Evaluación iniciada',
        'Se registró la evaluación de la ficha.',
      ),
    );
    expect(registrarEvaluacion).toHaveBeenCalledWith({ fichaPerfilId: 'f-1' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('lanza el toast de error y muestra la alerta inline cuando el registro falla', async () => {
    // Arrange
    const user = userEvent.setup();
    getEvaluacionFicha.mockResolvedValue([]);
    registrarEvaluacion.mockRejectedValue(new Error('Red caída'));
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Act
    await user.click(await screen.findByRole('button', { name: 'Iniciar evaluación' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Iniciar evaluación' }),
    );

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error al iniciar la evaluación', expect.any(String)),
    );
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('muestra la última evaluación de la lista y no ofrece iniciar otra', async () => {
    // Arrange
    getEvaluacionFicha.mockResolvedValue([
      { ...EVALUACION, id: 'ev-0', estadoEvaluacionNombre: 'Anterior' },
      EVALUACION,
    ]);

    // Act
    render(<RegistrarEvaluacionPanel fichaPerfilId="f-1" />);

    // Assert
    expect(await screen.findByText('Evaluación registrada')).toBeInTheDocument();
    expect(screen.getByText('En revisión')).toBeInTheDocument();
    expect(screen.getByText('ev-1')).toBeInTheDocument();
    expect(screen.queryByText('Anterior')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Iniciar evaluación' })).not.toBeInTheDocument();
  });
});
