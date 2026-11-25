import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '../../../test-utils/render';
import type { Page } from '../../../shared/models/api-response';
import type { FichaPerfilRepresentante } from '../models/FichaPerfilRepresentante';
import { fichasPerfilService } from '../services/fichasPerfilService';
import { useFichasParticipacion } from './useFichasParticipacion';

vi.mock('../services/fichasPerfilService', () => ({
  fichasPerfilService: {
    getFichasParticipacion: vi.fn(),
  },
}));

const consultar = vi.mocked(fichasPerfilService.getFichasParticipacion);

const VACIOS = { titulo: '', asesorNombre: '', asesorEmail: '', estadoIds: [] };

const ficha: FichaPerfilRepresentante = {
  id: 'f-1',
  titulo: 'Sistema de monitoreo',
  asesorNombre: 'Ana Ruiz',
  asesorEmail: 'ana@uco.edu.co',
  estadoId: 'DISPONIBLE_PARA_EVALUACION',
  estadoActual: 'Disponible para evaluación',
  estadoFechaActualizacion: '2026-09-01T10:00:00',
  evaluacionId: 'ev-1',
  evaluacionEstadoId: 'EN_EVALUACION',
  evaluacionEstadoNombre: 'En evaluación',
};

function crearPagina(numero: number): Page<FichaPerfilRepresentante> {
  return {
    content: [ficha],
    page: numero,
    size: 10,
    totalElements: 12,
    totalPages: 2,
    first: numero === 0,
    last: numero === 1,
    empty: false,
  };
}

function crearWrapper(entrada = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[entrada]}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

function montarConUrl(entrada = '/') {
  return renderHook(() => ({ hook: useFichasParticipacion(), url: useLocation().search }), {
    wrapper: crearWrapper(entrada),
  });
}

describe('useFichasParticipacion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultar.mockImplementation((page) => Promise.resolve(crearPagina(page)));
  });

  it('consulta la página 0 sin filtros, con orden por título ascendente', async () => {
    // Act
    const { result } = montarConUrl();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(0, 10, VACIOS, ['tituloProyecto:ASC']);
    expect(result.current.hook.page).toBe(0);
    expect(result.current.hook.pageSize).toBe(10);
    expect(result.current.hook.data?.content).toEqual([ficha]);
  });

  it('los setters y toggleEstado actualizan la URL y vuelven a la página 0', async () => {
    // Arrange
    const { result } = montarConUrl('/?vista=participo&pagina=2');
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.setTitulo(' monitoreo '));
    act(() => result.current.hook.setAsesorNombre('Ana'));
    act(() => result.current.hook.setAsesorEmail('ana@'));
    act(() => result.current.hook.toggleEstado('APROBADA'));
    act(() => result.current.hook.toggleEstado('NO_APROBADA'));
    act(() => result.current.hook.toggleEstado('APROBADA'));

    // Assert
    expect(result.current.hook.page).toBe(0);
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        0,
        10,
        {
          titulo: 'monitoreo',
          asesorNombre: 'Ana',
          asesorEmail: 'ana@',
          estadoIds: ['NO_APROBADA'],
        },
        ['tituloProyecto:ASC'],
      ),
    );
  });

  it('setOrden y goToPage consultan con el orden y la página pedidos', async () => {
    // Arrange
    const { result } = montarConUrl();
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.goToPage(1));
    await waitFor(() => expect(result.current.hook.page).toBe(1));
    act(() => result.current.hook.setOrden('asesorNombre', 'DESC'));

    // Assert
    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(0, 10, VACIOS, ['asesorNombre:DESC']),
    );
    expect(result.current.hook.ordenCampo).toBe('asesorNombre');
    expect(result.current.hook.ordenDireccion).toBe('DESC');
  });

  it('traduce q, asesor, correo, estado repetido, orden y pagina de la URL', async () => {
    // Act
    const { result } = montarConUrl(
      '/?q=monitoreo&asesor=Ana&correo=ana@&estado=APROBADA&estado=NO_APROBADA&orden=asesorNombre:DESC&pagina=3',
    );
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Assert
    expect(consultar).toHaveBeenCalledWith(
      2,
      10,
      {
        titulo: 'monitoreo',
        asesorNombre: 'Ana',
        asesorEmail: 'ana@',
        estadoIds: ['APROBADA', 'NO_APROBADA'],
      },
      ['asesorNombre:DESC'],
    );
  });

  it('limpiarEstados quita solo los estados y limpiarFiltros conserva vista', async () => {
    // Arrange
    const { result } = montarConUrl(
      '/?vista=participo&q=x&asesor=a&correo=c&estado=APROBADA&pagina=2',
    );
    await waitFor(() => expect(result.current.hook.isSuccess).toBe(true));

    // Act
    act(() => result.current.hook.limpiarEstados());

    // Assert
    expect(result.current.url).toBe('?vista=participo&q=x&asesor=a&correo=c');

    // Act
    act(() => result.current.hook.limpiarFiltros());

    // Assert
    expect(result.current.url).toBe('?vista=participo');
  });

  it('expone el error cuando el service falla', async () => {
    // Arrange
    consultar.mockRejectedValue(new Error('fallo de red'));

    // Act
    const { result } = montarConUrl();

    // Assert
    await waitFor(() => expect(result.current.hook.isError).toBe(true));
    expect(result.current.hook.data).toBeUndefined();
  });
});
