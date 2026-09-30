import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import { Rol } from '../../../shared/models/rol';
import type { Usuario } from '../models/Usuario';
import { usuariosService } from '../services/usuariosService';
import { construirFiltro, useUsuarios } from './useUsuarios';

vi.mock('../services/usuariosService', () => ({
  usuariosService: {
    consultarUsuariosAdministrador: vi.fn(),
    consultarEstudiantesAdministrador: vi.fn(),
    consultarCoordinadoresAdministrador: vi.fn(),
    registrarUsuario: vi.fn(),
  },
}));

const consultar = vi.mocked(usuariosService.consultarUsuariosAdministrador);

const usuario: Usuario = {
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
};

function crearPagina(numero: number, content: Usuario[]): Page<Usuario> {
  return {
    content,
    page: numero,
    size: 10,
    totalElements: 12,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: content.length === 0,
  };
}

function crearWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('construirFiltro', () => {
  it('sin roles, estado ni vigencia devuelve undefined', () => {
    // Act
    const filtro = construirFiltro([], undefined, undefined);

    // Assert
    expect(filtro).toBeUndefined();
  });

  it('con un solo rol devuelve un nodo PREDICADO directo', () => {
    // Act
    const filtro = construirFiltro([Rol.Estudiante], undefined, undefined);

    // Assert
    expect(filtro).toEqual({
      tipo: 'PREDICADO',
      campo: 'esEstudiante',
      operador: 'ES',
      valor: 'true',
    });
  });

  it('con dos roles devuelve un GRUPO OR con un predicado por rol', () => {
    // Act
    const filtro = construirFiltro([Rol.Estudiante, Rol.Asesor], undefined, undefined);

    // Assert
    expect(filtro).toEqual({
      tipo: 'GRUPO',
      conector: 'OR',
      nodos: [
        { tipo: 'PREDICADO', campo: 'esEstudiante', operador: 'ES', valor: 'true' },
        { tipo: 'PREDICADO', campo: 'esAsesor', operador: 'ES', valor: 'true' },
      ],
    });
  });

  it('con roles múltiples más estado y vigencia anida el GRUPO OR en un GRUPO AND', () => {
    // Act
    const filtro = construirFiltro([Rol.Estudiante, Rol.Asesor], 'ACTIVO', true);

    // Assert
    expect(filtro).toEqual({
      tipo: 'GRUPO',
      conector: 'AND',
      nodos: [
        {
          tipo: 'GRUPO',
          conector: 'OR',
          nodos: [
            { tipo: 'PREDICADO', campo: 'esEstudiante', operador: 'ES', valor: 'true' },
            { tipo: 'PREDICADO', campo: 'esAsesor', operador: 'ES', valor: 'true' },
          ],
        },
        { tipo: 'PREDICADO', campo: 'estado', operador: 'ES', valor: 'ACTIVO' },
        { tipo: 'PREDICADO', campo: 'vigente', operador: 'ES', valor: 'true' },
      ],
    });
  });
});

describe('useUsuarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta la página 0 sin filtros y devuelve los datos del service', async () => {
    // Arrange
    const pagina = crearPagina(0, [usuario]);
    consultar.mockResolvedValue(pagina);

    // Act
    const { result } = renderHook(() => useUsuarios(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith({
      pagina: 0,
      tamanio: 10,
      ordenamiento: undefined,
      filtros: undefined,
    });
    expect(result.current.data).toEqual(pagina);
    expect(result.current.page).toBe(0);
    expect(result.current.pageSize).toBe(10);
  });

  it('cambiar de página conserva el filtro activo en la queryKey', async () => {
    // Arrange
    consultar.mockImplementation((req) =>
      Promise.resolve(crearPagina(req.pagina, req.pagina === 0 ? [usuario] : [])),
    );
    const { result } = renderHook(() => useUsuarios(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Act
    act(() => result.current.toggleRol(Rol.Estudiante));
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagina: 0,
          filtros: { tipo: 'PREDICADO', campo: 'esEstudiante', operador: 'ES', valor: 'true' },
        }),
      ),
    );
    act(() => result.current.goToPage(1));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({
          pagina: 1,
          filtros: { tipo: 'PREDICADO', campo: 'esEstudiante', operador: 'ES', valor: 'true' },
        }),
      ),
    );
    expect(result.current.page).toBe(1);
  });

  it('refetch fuerza una nueva llamada al service', async () => {
    // Arrange
    consultar.mockResolvedValue(crearPagina(0, [usuario]));
    const { result } = renderHook(() => useUsuarios(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(consultar).toHaveBeenCalledTimes(1);

    // Act
    await act(async () => {
      await result.current.refetch();
    });

    // Assert
    expect(consultar).toHaveBeenCalledTimes(2);
  });
});
