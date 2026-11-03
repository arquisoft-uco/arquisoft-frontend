import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test-utils/render';
import { useEstudiantesArtefacto } from '../../hooks/useEstudiantesArtefacto';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import EstudiantesArtefactoPanel from './EstudiantesArtefactoPanel';

vi.mock('../../hooks/useEstudiantesArtefacto', () => ({ useEstudiantesArtefacto: vi.fn() }));
vi.mock('../../hooks/useRemoverEstudianteArtefacto', () => ({
  useRemoverEstudianteArtefacto: vi.fn(),
}));
vi.mock('./VincularEstudiantesForm', () => ({
  default: () => <form aria-label="Vincular estudiantes" />,
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
    expect(screen.queryByRole('form', { name: 'Vincular estudiantes' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Quitar a Luis Gómez del artefacto' })).toBeNull();
  });

  it('el pie avisa que los cambios son inmediatos y Cerrar cierra el panel', async () => {
    // Arrange
    const onCerrar = vi.fn();
    const user = userEvent.setup();
    render(<EstudiantesArtefactoPanel artefacto={ARTEFACTO} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(screen.getByText('Los cambios se aplican al instante.')).toBeInTheDocument();
    await waitFor(() => expect(onCerrar).toHaveBeenCalledTimes(1));
  });

  it('muestra el formulario de vincular debajo de la lista de estudiantes', () => {
    // Act
    render(<EstudiantesArtefactoPanel artefacto={ARTEFACTO} onCerrar={vi.fn()} />);

    // Assert
    const lista = screen.getByRole('list', { name: 'Estudiantes del artefacto' });
    const formulario = screen.getByRole('form', { name: 'Vincular estudiantes' });
    expect(
      lista.compareDocumentPosition(formulario) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
