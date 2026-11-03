import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import { useEstudiantesArtefacto } from '../../hooks/useEstudiantesArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import EstudiantesArtefactoPanel from './EstudiantesArtefactoPanel';

vi.mock('../../hooks/useEstudiantesArtefacto', () => ({ useEstudiantesArtefacto: vi.fn() }));
vi.mock('./VincularEstudiantesPanel', () => ({
  default: ({ onVolver }: { onVolver: () => void }) => (
    <div role="dialog" aria-label="Formulario de vincular">
      <button type="button" onClick={onVolver}>
        Cancelar vinculación
      </button>
    </div>
  ),
}));

const ARTEFACTO: ArtefactoAsesor = {
  id: 'a-1',
  proyectoGrado: 'p-1',
  nombreProyecto: 'Sistema de riego',
  versionRepositorioArtefacto: 'r-1',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  omitido: false,
};

describe('EstudiantesArtefactoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useEstudiantesArtefacto).mockReturnValue({
      data: [
        {
          id: 'ea-1',
          artefactoId: 'a-1',
          estudianteId: 'e-1',
          identificador: '2001',
          nombre: 'Luis Gómez',
          email: 'luis@uco.edu.co',
          vigente: true,
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as Partial<ReturnType<typeof useEstudiantesArtefacto>> as ReturnType<
      typeof useEstudiantesArtefacto
    >);
  });

  it('un artefacto omitido muestra el aviso y no ofrece vincular', () => {
    // Act
    render(
      <EstudiantesArtefactoPanel artefacto={{ ...ARTEFACTO, omitido: true }} onCerrar={vi.fn()} />,
    );

    // Assert
    expect(screen.getByText(/Este artefacto está omitido/)).toBeInTheDocument();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Vincular estudiantes' })).toBeNull();
  });

  it('vincular abre el formulario y cancelar vuelve a la lista', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<EstudiantesArtefactoPanel artefacto={ARTEFACTO} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Vincular estudiantes' }));
    expect(screen.getByRole('dialog', { name: 'Formulario de vincular' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar vinculación' }));

    // Assert
    expect(screen.queryByRole('dialog', { name: 'Formulario de vincular' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Vincular estudiantes' })).toBeInTheDocument();
  });
});
