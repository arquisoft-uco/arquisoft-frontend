import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useMiFichaPerfil } from './useMiFichaPerfil';

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

function crearWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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

  it('expone la ficha activa y los compañeros del listado', async () => {
    // Arrange
    consultar.mockResolvedValue([FICHA]);

    // Act
    const { result } = renderHook(() => useMiFichaPerfil(), { wrapper: crearWrapper() });
    await waitFor(() => expect(result.current.ficha).toEqual(FICHA));

    // Assert
    expect(result.current.companeros).toEqual(FICHA.integrantes);
    expect(result.current.sinFicha).toBe(false);
    expect(result.current.errorFicha).toBe(false);
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
    expect(modificar).toHaveBeenCalledWith({ fichaPerfilId: 'f-1', tituloProyecto: 'Nuevo título' });
    expect(result.current.fichas[1].tituloProyecto).toBe('Otra');
  });
});
