import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen } from '../../../../test-utils/render';
import { resetAllStores } from '../../../../test-utils/store.utils';
import RegistrarMapaRutaPanel from './RegistrarMapaRutaPanel';
import { useAgregarMapaRuta } from '../../hooks/useAgregarMapaRuta';
import { useProyectosElegibles } from '../../hooks/useProyectosElegibles';
import { toast } from '../../../../shared/hooks/useToast';

vi.mock('../../hooks/useAgregarMapaRuta', () => ({ useAgregarMapaRuta: vi.fn() }));
vi.mock('../../hooks/useProyectosElegibles', () => ({ useProyectosElegibles: vi.fn() }));
vi.mock('../../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn(), dismiss: vi.fn() },
}));

const useAgregarMock = vi.mocked(useAgregarMapaRuta);
const useProyectosMock = vi.mocked(useProyectosElegibles);

function mockCatalogo(parciales: Partial<ReturnType<typeof useProyectosElegibles>> = {}) {
  const catalogo = {
    proyectos: [
      { id: 'p-1', titulo: 'Sistema de monitoreo' },
      { id: 'p-2', titulo: 'Plataforma web' },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    hayMas: false,
    cargandoMas: false,
    cargarMas: vi.fn(),
    ...parciales,
  } as ReturnType<typeof useProyectosElegibles>;
  useProyectosMock.mockReturnValue(catalogo);
  return catalogo;
}

function mockMutacion(mutate = vi.fn()) {
  useAgregarMock.mockReturnValue({
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
  } as ReturnType<typeof useAgregarMapaRuta>);
  return mutate;
}

function crearErrorApi(status: number, errorCode: string, extra: Record<string, unknown> = {}) {
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: { error: 'Error', errorCode, message: 'crudo', status, ...extra },
    status,
    statusText: 'Error',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

type Usuario = ReturnType<typeof userEvent.setup>;

async function llenar(user: Usuario, inicio: string, fin: string) {
  await user.type(screen.getByLabelText(/Fecha de inicio/), inicio);
  await user.type(screen.getByLabelText(/Fecha de fin/), fin);
  await user.click(screen.getByRole('combobox', { name: 'Proyecto' }));
  await user.click(screen.getByRole('option', { name: /Sistema de monitoreo/ }));
}

const CREAR = { name: 'Crear mapa de ruta' };

describe('RegistrarMapaRutaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAllStores();
    mockCatalogo();
    mockMutacion();
  });

  it('muestra el skeleton mientras carga el catálogo', () => {
    // Arrange
    mockCatalogo({ proyectos: [], isLoading: true });

    // Act
    render(<RegistrarMapaRutaPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando proyectos…');
  });

  it('sin proyectos en proceso avisa y deshabilita el envío', () => {
    // Arrange
    mockCatalogo({ proyectos: [] });

    // Act
    render(<RegistrarMapaRutaPanel onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('No tienes proyectos en proceso')).toBeInTheDocument();
    expect(screen.getByRole('button', CREAR)).toBeDisabled();
  });

  it('si el catálogo falla muestra el error, reintentar llama a refetch y el envío queda deshabilitado', async () => {
    // Arrange
    const user = userEvent.setup();
    const catalogo = mockCatalogo({ proyectos: [], isError: true, error: new Error('500') });
    render(<RegistrarMapaRutaPanel onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: /Reintentar/ }));

    // Assert
    expect(screen.getByText('No se pudieron cargar los proyectos')).toBeInTheDocument();
    expect(catalogo.refetch).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', CREAR)).toBeDisabled();
  });

  it('un fin anterior al inicio muestra el error en la fecha de fin y no registra', async () => {
    // Arrange
    const user = userEvent.setup();
    const mutate = mockMutacion();
    render(<RegistrarMapaRutaPanel onCerrar={vi.fn()} />);

    // Act
    await llenar(user, '2026-12-01', '2026-10-01');
    await user.click(screen.getByRole('button', CREAR));

    // Assert
    expect(
      (await screen.findAllByText('La fecha de fin debe ser posterior a la de inicio')).length,
    ).toBeGreaterThan(0);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('con datos válidos registra con el body traducido, notifica y cierra', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const mutate = mockMutacion(
      vi.fn((_req: unknown, opciones?: { onSuccess?: () => void }) => opciones?.onSuccess?.()),
    );
    render(<RegistrarMapaRutaPanel onCerrar={onCerrar} />);

    // Act
    await llenar(user, '2026-10-22', '2026-12-01');
    await user.click(screen.getByRole('button', CREAR));

    // Assert
    expect(mutate).toHaveBeenCalledWith(
      { proyectoGradoId: 'p-1', fechaInicio: '2026-10-22', fechaFin: '2026-12-01' },
      expect.anything(),
    );
    expect(toast.success).toHaveBeenCalledWith('Mapa de ruta creado', expect.any(String));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('un 422 MAPA_RUTA_DUPLICADO mantiene el panel, pinta el error del proyecto y notifica', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockMutacion(
      vi.fn((_req: unknown, opciones?: { onError?: (e: unknown) => void }) =>
        opciones?.onError?.(crearErrorApi(422, 'MAPA_RUTA_DUPLICADO')),
      ),
    );
    render(<RegistrarMapaRutaPanel onCerrar={onCerrar} />);

    // Act
    await llenar(user, '2026-10-22', '2026-12-01');
    await user.click(screen.getByRole('button', CREAR));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo crear el mapa de ruta',
      'Este proyecto ya tiene un mapa de ruta.',
    );
    expect(
      (await screen.findAllByText('Este proyecto ya tiene un mapa de ruta.')).length,
    ).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Fecha de inicio/)).toHaveValue('2026-10-22');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('los fieldErrors de un 400 se pintan junto a su campo', async () => {
    // Arrange
    const user = userEvent.setup();
    mockMutacion(
      vi.fn((_req: unknown, opciones?: { onError?: (e: unknown) => void }) =>
        opciones?.onError?.(
          crearErrorApi(400, 'VALIDACION', {
            fieldErrors: [{ field: 'fechaInicio', message: 'Fecha inválida del servidor' }],
          }),
        ),
      ),
    );
    render(<RegistrarMapaRutaPanel onCerrar={vi.fn()} />);

    // Act
    await llenar(user, '2026-10-22', '2026-12-01');
    await user.click(screen.getByRole('button', CREAR));

    // Assert
    expect((await screen.findAllByText('Fecha inválida del servidor')).length).toBeGreaterThan(0);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('con más páginas ofrece «Cargar más proyectos» y lo llama', async () => {
    // Arrange
    const user = userEvent.setup();
    const catalogo = mockCatalogo({ hayMas: true });
    render(<RegistrarMapaRutaPanel onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('combobox', { name: 'Proyecto' }));
    await user.click(screen.getByRole('button', { name: /Cargar más proyectos/ }));

    // Assert
    expect(catalogo.cargarMas).toHaveBeenCalledTimes(1);
  });
});
