import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import ConsultarFichasPerfilCoordinador from './ConsultarFichasPerfilCoordinador';
import { useFichasPerfilCoordinador } from '../../hooks/useFichasPerfilCoordinador';
import type { FichaPerfil } from '../../models/FichaPerfil';
import type { Page } from '../../../../shared/models/api-response';

vi.mock('../../hooks/useFichasPerfilCoordinador', () => ({
  useFichasPerfilCoordinador: vi.fn(),
}));

vi.mock('./EstudiantesVinculadosPanel', () => ({ default: () => null }));
vi.mock('./CambiarAsesorForm', () => ({ default: () => null }));

const FICHA_ANA: FichaPerfil = {
  id: 'f-1',
  tituloProyecto: 'Sistema de monitoreo',
  asesorFicha: { id: 'a-1', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
};

const FICHA_LUIS: FichaPerfil = {
  id: 'f-2',
  tituloProyecto: 'Plataforma de tutorías',
  asesorFicha: { id: 'a-2', nombre: 'Luis Gómez', email: 'luis@uco.edu.co' },
};

function crearPagina(content: FichaPerfil[]): Page<FichaPerfil> {
  return {
    content,
    page: 0,
    size: 10,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function crearHookMock(
  parcial: Partial<ReturnType<typeof useFichasPerfilCoordinador>> = {},
): ReturnType<typeof useFichasPerfilCoordinador> {
  return {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    page: 0,
    pageSize: 10,
    goToPage: vi.fn(),
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useFichasPerfilCoordinador>;
}

describe('ConsultarFichasPerfilCoordinador', () => {
  beforeEach(() => {
    vi.mocked(useFichasPerfilCoordinador).mockReset();
  });

  it('muestra el estado de carga con un texto accesible', () => {
    vi.mocked(useFichasPerfilCoordinador).mockReturnValue(crearHookMock({ isLoading: true }));

    render(<ConsultarFichasPerfilCoordinador />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando fichas de perfil...');
  });

  it('muestra un aviso con role="alert" cuando la consulta falla', () => {
    vi.mocked(useFichasPerfilCoordinador).mockReturnValue(
      crearHookMock({ isError: true, error: new Error('fallo de red') }),
    );

    render(<ConsultarFichasPerfilCoordinador />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las fichas de perfil. Intenta nuevamente.',
    );
  });

  it('muestra el contador en plural, una fila por ficha y los slots de cabecera y formulario', () => {
    vi.mocked(useFichasPerfilCoordinador).mockReturnValue(
      crearHookMock({ data: crearPagina([FICHA_ANA, FICHA_LUIS]) }),
    );

    render(
      <ConsultarFichasPerfilCoordinador
        accionHeader={<button type="button">Acción de prueba</button>}
        formulario={<p>Formulario de prueba</p>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Fichas de Perfil' })).toBeInTheDocument();
    expect(screen.getByText('2 fichas registradas')).toBeInTheDocument();
    expect(screen.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(screen.getByText('Plataforma de tutorías')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acción de prueba' })).toBeInTheDocument();
    expect(screen.getByText('Formulario de prueba')).toBeInTheDocument();
  });

  it('muestra el contador en singular cuando hay una sola ficha', () => {
    vi.mocked(useFichasPerfilCoordinador).mockReturnValue(
      crearHookMock({ data: crearPagina([FICHA_ANA]) }),
    );

    render(<ConsultarFichasPerfilCoordinador />);

    expect(screen.getByText('1 ficha registrada')).toBeInTheDocument();
  });

  it('vuelve a consultar cuando se pulsa Actualizar', async () => {
    const refetch = vi.fn();
    vi.mocked(useFichasPerfilCoordinador).mockReturnValue(
      crearHookMock({ data: crearPagina([FICHA_ANA]), refetch }),
    );
    const user = userEvent.setup();

    render(<ConsultarFichasPerfilCoordinador />);
    await user.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
