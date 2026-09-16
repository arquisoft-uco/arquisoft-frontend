import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AdministradorView from './AdministradorView';
import { useRegistrarUsuario } from '../hooks/useRegistrarUsuario';

vi.mock('../hooks/useRegistrarUsuario', () => ({
  useRegistrarUsuario: vi.fn(),
}));

function crearMutacionMock(
  mutate: ReturnType<typeof vi.fn>,
): ReturnType<typeof useRegistrarUsuario> {
  return {
    data: undefined,
    error: null,
    variables: undefined,
    context: undefined,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    submittedAt: 0,
    status: 'idle',
    isError: false,
    isIdle: true,
    isPending: false,
    isSuccess: false,
    mutate,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  } as ReturnType<typeof useRegistrarUsuario>;
}

describe('AdministradorView', () => {
  it('muestra el botón "Registrar usuario" por defecto y alterna con el formulario al abrir y cerrar', async () => {
    vi.mocked(useRegistrarUsuario).mockReturnValue(crearMutacionMock(vi.fn()));
    const user = userEvent.setup();
    render(<AdministradorView />);

    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^registrar$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /registrar usuario/i }));

    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^registrar$/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^registrar$/i })).not.toBeInTheDocument();
  });
});
