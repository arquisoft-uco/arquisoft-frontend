import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import { render, screen, waitFor } from '../../../test-utils/render';
import type { VersionArtefacto } from '../models/VersionArtefacto';
import { useVersionArtefacto } from '../hooks/useVersionArtefacto';
import DetalleVersionArtefactoPanel from './DetalleVersionArtefactoPanel';

vi.mock('../hooks/useVersionArtefacto', () => ({
  useVersionArtefacto: vi.fn(),
}));

const hook = vi.mocked(useVersionArtefacto);

type Resultado = ReturnType<typeof useVersionArtefacto>;

function estado(parcial: Partial<Resultado>): Resultado {
  const base: Partial<Resultado> = {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  };
  return Object.assign(base, parcial) as Resultado;
}

function error422(errorCode: string) {
  const cuerpo = { error: 'Unprocessable Entity', errorCode, message: 'x', status: 422 };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    data: cuerpo,
    status: 422,
    statusText: cuerpo.error,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });
}

const FILA: VersionArtefacto = {
  id: 'v-1',
  artefacto: 'a-1',
  version: 4,
  fechaCreacion: '2026-03-10T15:30:00Z',
  nombreProyecto: 'Sistema de riego',
  nombreDocumento: 'Acta de inicio',
  versionDocumento: 2,
  nombreRepositorio: 'Repositorio base',
  nombreAsesor: 'Marta Gómez',
  revisionAsesor: null,
  estadoRevision: null,
  nombreEstadoRevision: null,
};

const DETALLE: VersionArtefacto = {
  ...FILA,
  uriArchivo: 'almacen/proyectos/acta-inicio-v4.pdf',
  revisionAsesor: 'r-1',
  estadoRevision: 'EN_PROGRESO',
  nombreEstadoRevision: 'En progreso',
};

function renderizar(onCerrar = vi.fn()) {
  render(<DetalleVersionArtefactoPanel version={FILA} onCerrar={onCerrar} />);
  return onCerrar;
}

describe('DetalleVersionArtefactoPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mientras carga muestra el esqueleto accesible con el título y la descripción de la fila', () => {
    // Arrange
    hook.mockReturnValue(estado({ isLoading: true }));

    // Act
    renderizar();

    // Assert
    expect(hook).toHaveBeenCalledWith('v-1');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Información de la versión')).toBeInTheDocument();
    expect(screen.getByText('Acta de inicio · Versión 4')).toBeInTheDocument();
  });

  it('con datos muestra versión, ubicación, contexto y estado de la revisión', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: DETALLE }));

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('almacen/proyectos/acta-inicio-v4.pdf')).toBeInTheDocument();
    expect(screen.getByText('Sistema de riego')).toBeInTheDocument();
    expect(screen.getByText('Versión 2 del documento')).toBeInTheDocument();
    expect(screen.getByText('Repositorio base')).toBeInTheDocument();
    expect(screen.getByText('Marta Gómez')).toBeInTheDocument();
    expect(screen.getByText('En progreso')).toBeInTheDocument();
  });

  it('sin revisión indica "Sin revisión" y "No disponible" si falta la ubicación', () => {
    // Arrange
    hook.mockReturnValue(estado({ data: FILA }));

    // Act
    renderizar();

    // Assert
    expect(screen.getByText('Sin revisión')).toBeInTheDocument();
    expect(screen.getByText('Esta versión aún no tiene revisiones.')).toBeInTheDocument();
    expect(screen.getByText('No disponible')).toBeInTheDocument();
  });

  it.each([
    ['VERSION_ARTEFACTO_NO_ENCONTRADA', 'Esta versión ya no está disponible.'],
    ['VERSION_ARTEFACTO_ACCESO_DENEGADO', 'No tienes acceso a esta versión.'],
  ])('un 422 %s muestra su aviso y sin "Reintentar"', (codigo, aviso) => {
    // Arrange
    hook.mockReturnValue(estado({ isError: true, error: error422(codigo) }));

    // Act
    renderizar();

    // Assert
    expect(screen.getByText(aviso)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it('ante otro error muestra el aviso y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const refetch = vi.fn();
    hook.mockReturnValue(estado({ isError: true, error: new Error('red'), refetch }));
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: /reintentar/i }));

    // Assert
    expect(screen.getByText('No pudimos cargar la información de la versión')).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('"Cerrar" llama a onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    hook.mockReturnValue(estado({ data: DETALLE }));
    const onCerrar = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    await waitFor(() => expect(onCerrar).toHaveBeenCalled());
  });
});
