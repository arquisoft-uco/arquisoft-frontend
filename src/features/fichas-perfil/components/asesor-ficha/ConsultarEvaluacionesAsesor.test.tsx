import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router';
import { render, screen, within } from '../../../../test-utils/render';
import ConsultarEvaluacionesAsesor from './ConsultarEvaluacionesAsesor';
import { useEvaluacionesFichasAsesor } from '../../hooks/useEvaluacionesFichasAsesor';
import type { Page } from '../../../../shared/models/api-response';
import type { EvaluacionFichaPerfilAsesor } from '../../models/EvaluacionFichaPerfilAsesor';

vi.mock('../../hooks/useEvaluacionesFichasAsesor', () => ({
  useEvaluacionesFichasAsesor: vi.fn(),
}));

const EVALUACION: EvaluacionFichaPerfilAsesor = {
  id: 'ev-1',
  fichaPerfilId: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  fechaCreacion: '2026-09-01T10:00:00Z',
  estadoEvaluacionId: 'APROBADA',
  estadoEvaluacionNombre: 'Aprobada',
  representante: { id: 'r-1', nombre: 'Luis Gómez' },
};

function crearPagina(
  content: EvaluacionFichaPerfilAsesor[],
  { totalPages = 1, totalElements = content.length } = {},
) {
  return {
    content,
    page: 0,
    size: 10,
    totalElements,
    totalPages,
    first: true,
    last: totalPages <= 1,
    empty: content.length === 0,
  } as Page<EvaluacionFichaPerfilAsesor>;
}

function mockHook(parcial: Partial<ReturnType<typeof useEvaluacionesFichasAsesor>> = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    isFetching: false,
    isPlaceholderData: false,
    refetch: vi.fn(),
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    texto: '',
    setTexto: vi.fn(),
    ordenCampo: 'fechaCreacion',
    ordenDireccion: 'DESC',
    setOrden: vi.fn(),
    limpiarFiltros: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useEvaluacionesFichasAsesor>;
  vi.mocked(useEvaluacionesFichasAsesor).mockReturnValue(hook);
  return hook;
}

function EstadoDeNavegacion() {
  const { pathname } = useLocation();
  return <p>{`destino:${pathname}`}</p>;
}

function tabla() {
  return within(screen.getByRole('table', { name: 'Evaluaciones de las fichas que asesoras' }));
}

describe('ConsultarEvaluacionesAsesor', () => {
  beforeEach(() => {
    vi.mocked(useEvaluacionesFichasAsesor).mockReset();
  });

  it('muestra un estado de carga accesible mientras llega la primera página', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<ConsultarEvaluacionesAsesor />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el error con "Reintentar" que vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<ConsultarEvaluacionesAsesor />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar las evaluaciones');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('sin evaluaciones ni búsqueda muestra el vacío "Aún no hay evaluaciones"', () => {
    // Arrange
    mockHook({ data: crearPagina([]) });

    // Act
    render(<ConsultarEvaluacionesAsesor />);

    // Assert
    expect(screen.getByText('Aún no hay evaluaciones')).toBeInTheDocument();
  });

  it('con búsqueda sin coincidencias muestra "Sin resultados" y "Limpiar filtros" los limpia', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([]), texto: 'zzz' });
    render(<ConsultarEvaluacionesAsesor />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

    // Assert
    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(hook.limpiarFiltros).toHaveBeenCalled();
  });

  it('cada evaluación muestra título, representante, estado y fecha; sin estado dice "Sin estado"', () => {
    // Arrange
    mockHook({
      data: crearPagina([
        EVALUACION,
        {
          ...EVALUACION,
          id: 'ev-2',
          fichaPerfilId: 'f-2',
          tituloProyecto: 'Otro proyecto',
          estadoEvaluacionId: null,
          estadoEvaluacionNombre: null,
        },
      ]),
    });

    // Act
    render(<ConsultarEvaluacionesAsesor />);

    // Assert
    expect(screen.getByText('2 evaluaciones')).toBeInTheDocument();
    expect(tabla().getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(tabla().getAllByText('Luis Gómez')).toHaveLength(2);
    expect(tabla().getByText('Aprobada')).toBeInTheDocument();
    expect(tabla().getByText('Sin estado')).toBeInTheDocument();
    expect(tabla().getAllByText((_, el) => el?.tagName === 'TIME')).toHaveLength(2);
  });

  it('el título es un enlace al detalle de la ficha', async () => {
    // Arrange
    const user = userEvent.setup();
    mockHook({ data: crearPagina([EVALUACION]) });
    render(
      <>
        <ConsultarEvaluacionesAsesor />
        <EstadoDeNavegacion />
      </>,
      { initialPath: '/fichas-perfil?vista=evaluaciones' },
    );

    // Act
    await user.click(tabla().getByRole('link', { name: 'Abrir la ficha Sistema de monitoreo' }));

    // Assert
    expect(screen.getByText('destino:/fichas-perfil/f-1/items')).toBeInTheDocument();
  });

  it('ordena por título y por fecha desde las cabeceras', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ data: crearPagina([EVALUACION]) });
    render(<ConsultarEvaluacionesAsesor />);

    // Act
    await user.click(tabla().getByRole('button', { name: /Ficha/ }));
    await user.click(tabla().getByRole('button', { name: /Creada el/ }));

    // Assert
    expect(hook.setOrden).toHaveBeenCalledTimes(2);
    expect(hook.setOrden).toHaveBeenNthCalledWith(1, 'tituloProyecto', expect.any(String));
    expect(hook.setOrden).toHaveBeenNthCalledWith(2, 'fechaCreacion', expect.any(String));
  });

  it('con varias páginas el paginador navega a la siguiente', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({
      data: crearPagina([EVALUACION], { totalElements: 25, totalPages: 3 }),
    });
    render(<ConsultarEvaluacionesAsesor />);

    // Act
    await user.click(
      within(screen.getByRole('navigation', { name: 'Paginación' })).getByRole('button', {
        name: 'Página siguiente',
      }),
    );

    // Assert
    expect(hook.goToPage).toHaveBeenCalledWith(1);
  });
});
