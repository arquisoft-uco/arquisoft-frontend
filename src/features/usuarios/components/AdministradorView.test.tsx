import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import AdministradorView from './AdministradorView';
import { usuariosService } from '../services/usuariosService';
import type { Page } from '../../../shared/models/api-response';
import type { Usuario } from '../models/Usuario';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    registrarUsuario: vi.fn(),
    consultarUsuariosAdministrador: vi.fn(),
    getEstadosUsuario: vi.fn(),
  },
}));

const USUARIO: Usuario = {
  id: 'u-1',
  identificador: '2001',
  nombre: 'Marta Ríos',
  email: 'marta@uco.edu.co',
  contacto: '3001234567',
  estado: 'ACTIVO',
  vigente: true,
  esEstudiante: true,
  esAsesor: false,
  esAsesorFicha: false,
  esCoordinador: false,
  esRepresentanteComite: false,
  esAdministrador: false,
  esBibliotecario: false,
};

function crearPagina(content: Usuario[]): Page<Usuario> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('AdministradorView', () => {
  beforeEach(() => {
    vi.mocked(usuariosService.consultarUsuariosAdministrador)
      .mockReset()
      .mockResolvedValue(crearPagina([USUARIO]));
    vi.mocked(usuariosService.getEstadosUsuario)
      .mockReset()
      .mockResolvedValue([{ id: 'ACTIVO', nombre: 'Activo', descripcion: 'Puede operar' }]);
  });

  it('monta el listado único con una sola consulta ordenada por nombre y sin pestañas', async () => {
    // Act
    render(<AdministradorView />);
    await screen.findByRole('table', { name: 'Usuarios' });

    // Assert
    expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledTimes(1);
    expect(usuariosService.consultarUsuariosAdministrador).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: ['nombre:ASC'],
      filtros: undefined,
    });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('alterna el botón "Registrar usuario" con el formulario al abrir y cerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    render(<AdministradorView />);
    await screen.findByRole('table', { name: 'Usuarios' });

    // Act
    await user.click(screen.getByRole('button', { name: /registrar usuario/i }));

    // Assert
    expect(screen.queryByRole('button', { name: /registrar usuario/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^registrar$/i })).toBeInTheDocument();

    // Act
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Assert
    expect(screen.getByRole('button', { name: /registrar usuario/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^registrar$/i })).not.toBeInTheDocument();
  });

  it('el vacío "Aún no hay usuarios" ofrece "Registrar usuario" y abre el formulario', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(usuariosService.consultarUsuariosAdministrador).mockResolvedValue(crearPagina([]));
    render(<AdministradorView />);
    await screen.findByText('Aún no hay usuarios');
    const botones = screen.getAllByRole('button', { name: /registrar usuario/i });
    expect(botones).toHaveLength(2);

    // Act
    await user.click(botones[1]);

    // Assert
    expect(screen.getByRole('button', { name: /^registrar$/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /registrar usuario/i })).toHaveLength(1);
  });
});
