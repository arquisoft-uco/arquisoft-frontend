import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { Asesor } from '../../../shared/models/Asesor';
import type { FichaPerfil } from '../models/FichaPerfil';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useCambiarAsesor } from './useCambiarAsesor';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    cambiarAsesor: vi.fn(),
    getFichasCoordinador: vi.fn(),
  },
}));

const cambiarAsesor = vi.mocked(fichasPerfilService.cambiarAsesor);

const ANA: Asesor = { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' };
const LUIS: Asesor = { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' };

const FICHA_1: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: ANA,
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};
const FICHA_2: FichaPerfil = {
  id: 'f-2',
  tituloProyecto: 'Plataforma de tutorías',
  asesorFicha: ANA,
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};
const FICHA_3: FichaPerfil = {
  id: 'f-3',
  tituloProyecto: 'Bot académico',
  asesorFicha: ANA,
  estado: { id: 'e-1', nombre: 'En revisión', fechaActualizacion: '2026-10-01T15:30:00' },
};

function crearPagina(numero: number, content: FichaPerfil[]): Page<FichaPerfil> {
  return {
    content,
    page: numero,
    size: 2,
    totalElements: 3,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: content.length === 0,
  };
}

function crearContexto() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  queryClient.setQueryData(['fichas-perfil', 'coordinador', 0], crearPagina(0, [FICHA_1, FICHA_2]));
  queryClient.setQueryData(['fichas-perfil', 'coordinador', 1], crearPagina(1, [FICHA_3, FICHA_1]));
  queryClient.setQueryData(['fichas-perfil', 'asesor', 0], crearPagina(0, [FICHA_1]));
  const invalidar = vi.spyOn(queryClient, 'invalidateQueries');
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  return { Wrapper, queryClient, invalidar };
}

describe('useCambiarAsesor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía solo idFicha e idAsesorFicha y reemplaza el asesor de esa ficha en todas las páginas cacheadas del coordinador e invalida el prefijo del coordinador', async () => {
    // Arrange
    cambiarAsesor.mockResolvedValue(undefined);
    const { Wrapper, queryClient, invalidar } = crearContexto();
    const { result } = renderHook(() => useCambiarAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ idFicha: 'f-1', idAsesorFicha: LUIS.id, asesorNuevo: LUIS }));

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(cambiarAsesor).toHaveBeenCalledWith({ idFicha: 'f-1', idAsesorFicha: 'a-2' });
    expect(
      queryClient.getQueryData<Page<FichaPerfil>>(['fichas-perfil', 'coordinador', 0])?.content,
    ).toEqual([{ ...FICHA_1, asesorFicha: LUIS }, FICHA_2]);
    expect(
      queryClient.getQueryData<Page<FichaPerfil>>(['fichas-perfil', 'coordinador', 1])?.content,
    ).toEqual([FICHA_3, { ...FICHA_1, asesorFicha: LUIS }]);
    expect(
      queryClient.getQueryData<Page<FichaPerfil>>(['fichas-perfil', 'coordinador', 0])?.content[0]
        .estado,
    ).toEqual(FICHA_1.estado);
    expect(queryClient.getQueryData(['fichas-perfil', 'asesor', 0])).toEqual(
      crearPagina(0, [FICHA_1]),
    );
    expect(invalidar).toHaveBeenCalledWith({ queryKey: ['fichas-perfil', 'coordinador'] });
  });

  it('deja la caché intacta y expone el error cuando el service rechaza', async () => {
    // Arrange
    cambiarAsesor.mockRejectedValue(new Error('422'));
    const { Wrapper, queryClient } = crearContexto();
    const { result } = renderHook(() => useCambiarAsesor(), { wrapper: Wrapper });

    // Act
    act(() => result.current.mutate({ idFicha: 'f-1', idAsesorFicha: LUIS.id, asesorNuevo: LUIS }));

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(
      queryClient.getQueryData<Page<FichaPerfil>>(['fichas-perfil', 'coordinador', 0])?.content,
    ).toEqual([FICHA_1, FICHA_2]);
  });
});
