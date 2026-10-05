import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useMiFichaPerfil } from './useMiFichaPerfil';
import { toast } from '../../../shared/hooks/useToast';

vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    consultarFichasPerfilEstudiante: vi.fn(),
    modificarTituloFichaPerfil: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.consultarFichasPerfilEstudiante);
const modificar = vi.mocked(fichasPerfilService.modificarTituloFichaPerfil);

const FICHA = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesor: { id: 'a-1', nombre: 'Ana Ruiz', email: 'ana@uco.edu.co' },
  estadoActual: { id: 'st-1', nombre: 'En revisión', fechaActualizacion: '2026-09-01T10:00:00' },
  integrantes: [{ id: 'e-1', nombre: 'Luis Pérez', email: 'luis@uco.edu.co' }],
};

function crearWrapper(
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

describe('useMiFichaPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expone la ficha activa con sus integrantes', async () => {
    // Arrange
    consultar.mockResolvedValue([FICHA]);

    // Act
    const { result } = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.ficha).toEqual(FICHA));

    // Assert
    expect(result.current.ficha?.integrantes).toEqual(FICHA.integrantes);
    expect(result.current.sinFicha).toBe(false);
    expect(result.current.errorFicha).toBe(false);
  });

  it('cargada es falsa hasta resolver, sinFicha no se marca antes y reintentar vuelve a pedir la ficha', async () => {
    // Arrange
    consultar.mockResolvedValue([FICHA]);

    // Act
    const { result } = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper() });
    const antes = { cargada: result.current.cargada, sinFicha: result.current.sinFicha };
    await waitFor(() => expect(result.current.cargada).toBe(true));
    await act(() => result.current.reintentar());

    // Assert
    expect(antes).toEqual({ cargada: false, sinFicha: false });
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('marca sinFicha con la lista vacía y errorFicha ante un fallo del service', async () => {
    // Arrange
    consultar.mockResolvedValueOnce([]);
    const vacio = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper() });
    await waitFor(() => expect(vacio.result.current.sinFicha).toBe(true));
    consultar.mockRejectedValueOnce(new Error('fallo'));

    // Act
    const fallido = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper() });

    // Assert
    await waitFor(() => expect(fallido.result.current.errorFicha).toBe(true));
    expect(vacio.result.current.errorFicha).toBe(false);
    expect(fallido.result.current.sinFicha).toBe(false);
  });

  it('modificarTitulo actualiza el título de la ficha activa en el listado', async () => {
    // Arrange
    consultar.mockResolvedValue([FICHA, { ...FICHA, id: 'f-2', tituloProyecto: 'Otra' }]);
    modificar.mockResolvedValue(undefined);
    const { result } = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.ficha?.id).toBe('f-1'));

    // Act
    act(() => result.current.modificarTitulo.mutate('Nuevo título'));

    // Assert
    await waitFor(() => expect(result.current.ficha?.tituloProyecto).toBe('Nuevo título'));
    expect(modificar).toHaveBeenCalledWith({
      fichaPerfilId: 'f-1',
      tituloProyecto: 'Nuevo título',
    });
    expect(result.current.fichas[1].tituloProyecto).toBe('Otra');
  });

  it('modificarTitulo invalida por prefijo los listados de coordinador, asesor y representante', async () => {
    // Arrange
    consultar.mockResolvedValue([FICHA]);
    modificar.mockResolvedValue(undefined);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper(queryClient) });
    await waitFor(() => expect(result.current.ficha?.id).toBe('f-1'));

    // Act
    act(() => result.current.modificarTitulo.mutate('Nuevo título'));

    // Assert
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['fichas-perfil', 'coordinador'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['fichas-perfil', 'asesor'] });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['fichas-perfil', 'representante'] });
  });

  it('modificarTitulo sin ficha no llama al service y avisa del error', async () => {
    // Arrange
    consultar.mockResolvedValue([]);
    const { result } = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.sinFicha).toBe(true));

    // Act
    act(() => result.current.modificarTitulo.mutate('Nuevo título'));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error al modificar', expect.any(String)),
    );
    expect(modificar).not.toHaveBeenCalled();
  });

  it('modificarTitulo avisa con toast.error cuando el service falla y no invalida', async () => {
    // Arrange
    consultar.mockResolvedValue([FICHA]);
    modificar.mockRejectedValue(new Error('fallo'));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper(queryClient) });
    await waitFor(() => expect(result.current.ficha?.id).toBe('f-1'));

    // Act
    act(() => result.current.modificarTitulo.mutate('Nuevo título'));

    // Assert
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Error al modificar', expect.any(String)),
    );
    expect(result.current.ficha?.tituloProyecto).toBe('Sistema de monitoreo');
    expect(invalidar).not.toHaveBeenCalled();
  });
});
