import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../test-utils/render';
import AdministradorView from './AdministradorView';
import { usuariosService } from '../services/usuariosService';
import type { Page } from '../../../shared/models/api-response';
import type { Usuario } from '../models/Usuario';
import type { Coordinador } from '../models/Coordinador';
import type { Estudiante } from '../models/Estudiante';
import type { Asesor } from '../models/Asesor';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    registrarUsuario: vi.fn(),
    consultarUsuariosAdministrador: vi.fn(),
    consultarCoordinadoresAdministrador: vi.fn(),
    consultarEstudiantesAdministrador: vi.fn(),
    consultarAsesoresAdministrador: vi.fn(),
  },
}));

function crearPaginaVacia<T>(): Page<T> {
  return {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    empty: true,
  };
}

describe('AdministradorView', () => {
  beforeEach(() => {
    vi.mocked(usuariosService.consultarUsuariosAdministrador)
      .mockReset()
      .mockResolvedValue(crearPaginaVacia<Usuario>());
    vi.mocked(usuariosService.consultarCoordinadoresAdministrador)
      .mockReset()
      .mockResolvedValue(crearPaginaVacia<Coordinador>());
    vi.mocked(usuariosService.consultarEstudiantesAdministrador)
      .mockReset()
      .mockResolvedValue(crearPaginaVacia<Estudiante>());
    vi.mocked(usuariosService.consultarAsesoresAdministrador)
      .mockReset()
      .mockResolvedValue(crearPaginaVacia<Asesor>());
  });

  it('monta "Todos los usuarios" desde el primer render y no monta las otras pestañas', async () => {
    render(<AdministradorView />);

    await waitFor(() =>
      expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1),
    );
    expect(screen.getByRole('heading', { name: 'Todos los usuarios' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Coordinadores' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Estudiantes' })).not.toBeInTheDocument();
    expect(usuariosService.consultarCoordinadoresAdministrador).not.toHaveBeenCalled();
    expect(usuariosService.consultarEstudiantesAdministrador).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: 'Asesores' })).not.toBeInTheDocument();
    expect(usuariosService.consultarAsesoresAdministrador).not.toHaveBeenCalled();
  });

  it('clic en "Asesores" la monta y consulta una vez; volver a "Todos los usuarios" no repite la consulta', async () => {
    const user = userEvent.setup();
    render(<AdministradorView />);
    await waitFor(() =>
      expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1),
    );

    await user.click(screen.getByRole('tab', { name: 'Asesores' }));

    await waitFor(() =>
      expect(usuariosService.consultarAsesoresAdministrador).toHaveBeenCalledTimes(1),
    );
    expect(screen.getByRole('heading', { name: 'Asesores' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Todos los usuarios' }));

    expect(usuariosService.consultarAsesoresAdministrador).toHaveBeenCalledTimes(1);
  });

  it('clic en "Coordinadores" la monta y consulta por primera vez; volver a "Todos los usuarios" no repite la consulta', async () => {
    const user = userEvent.setup();
    render(<AdministradorView />);
    await waitFor(() =>
      expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1),
    );

    await user.click(screen.getByRole('tab', { name: 'Coordinadores' }));

    await waitFor(() =>
      expect(usuariosService.consultarCoordinadoresAdministrador).toHaveBeenCalledTimes(1),
    );
    expect(screen.getByRole('heading', { name: 'Coordinadores' })).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Todos los usuarios' }));

    expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1);
  });

  it('"Registrar usuario" sigue visible al cambiar de pestaña', async () => {
    const user = userEvent.setup();
    render(<AdministradorView />);
    await waitFor(() =>
      expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1),
    );

    await user.click(screen.getByRole('tab', { name: 'Coordinadores' }));

    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
  });

  it('alterna el botón "Registrar usuario" con el formulario al abrir y cerrar', async () => {
    const user = userEvent.setup();
    render(<AdministradorView />);
    await waitFor(() =>
      expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1),
    );

    await user.click(screen.getByRole('button', { name: /registrar usuario/i }));

    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^registrar$/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^registrar$/i })).not.toBeInTheDocument();
  });
});
