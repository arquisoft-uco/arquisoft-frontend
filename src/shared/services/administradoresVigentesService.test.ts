import { describe, it, expect, vi } from 'vitest';
import apiClient from '../../api/axiosInstance';
import type { Page } from '../models/api-response';
import type { AdministradorVigente } from '../models/AdministradorVigente';
import { administradoresVigentesService } from './administradoresVigentesService';

vi.mock('../../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const post = vi.mocked(apiClient.post);

const pagina: Page<AdministradorVigente> = {
  content: [
    {
      id: 'adm-1',
      identificador: '1234567890',
      nombre: 'Ana Pérez',
      email: 'ana@uco.edu.co',
      contacto: '3001234567',
      estado: 'ACTIVO',
    },
  ],
  page: 0,
  size: 100,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  empty: false,
};

describe('administradoresVigentesService', () => {
  it('consulta con el criterio recibido y devuelve la página tal cual', async () => {
    // Arrange
    post.mockResolvedValue({ status: 200, data: pagina });
    const criterio = { pagina: 0, tamanio: 100, ordenamiento: ['nombre:ASC'] };

    // Act
    const resultado =
      await administradoresVigentesService.consultarAdministradoresVigentes(criterio);

    // Assert
    expect(post).toHaveBeenCalledWith('/usuarios/administradores/vigentes', criterio);
    expect(resultado).toEqual(pagina);
  });

  it('sin criterio envía el cuerpo vacío', async () => {
    post.mockResolvedValue({ status: 200, data: pagina });

    await administradoresVigentesService.consultarAdministradoresVigentes();

    expect(post).toHaveBeenLastCalledWith('/usuarios/administradores/vigentes', undefined);
  });
});
