import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Route, Routes } from 'react-router';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import { resetAllStores, setAuthenticatedUser } from '../../../test-utils/store.utils';
import { useConteos } from '../hooks/useConteos';
import type { RecursoContable } from '../models/RecursoContable';
import CoordinadorView from './CoordinadorView';

vi.mock('../hooks/useConteos', () => ({ useConteos: vi.fn() }));

const CONTEOS: Partial<Record<RecursoContable, number>> = {
  'fichas-coordinador': 42,
  'proyectos-coordinador': 8,
  'evaluaciones-coordinador': 5,
  'mapas-ruta-coordinador': 3,
  'solicitudes-novedad-coordinador-recibidas': 2,
  'solicitudes-cambio-asesor-recibidas': 1,
  'solicitudes-ampliacion-plazo-recibidas': 0,
};

function conteosMock(parcial: Partial<ReturnType<typeof useConteos>> = {}) {
  vi.mocked(useConteos).mockImplementation((recursos) => {
    const valores = recursos.map((recurso) => CONTEOS[recurso]);
    return {
      valores,
      total: valores.reduce<number>((suma, valor) => suma + (valor ?? 0), 0),
      cargando: false,
      hayError: false,
      reintentar: vi.fn(),
      ...parcial,
    };
  });
}

describe('CoordinadorView', () => {
  beforeEach(() => {
    resetAllStores();
    setAuthenticatedUser({ tokenParsed: { sub: 'u', given_name: 'Carla' } });
    conteosMock();
  });

  it('resume el programa, desglosa las solicitudes recibidas y la frase suma las tres bandejas', () => {
    render(<CoordinadorView />);

    expect(screen.getByRole('heading', { level: 1, name: 'Hola, Carla' })).toBeInTheDocument();
    expect(screen.getByText('Tienes 3 solicitudes recibidas.')).toBeInTheDocument();
    const resumen = screen.getByRole('region', { name: 'Resumen del programa' });
    expect(within(resumen).getByRole('link', { name: /Fichas de perfil/ })).toHaveTextContent('42');
    expect(within(resumen).getByRole('link', { name: /Mapas de ruta/ })).toHaveAttribute(
      'href',
      '/mapas-ruta',
    );
    const solicitudes = screen.getByRole('region', { name: 'Solicitudes recibidas' });
    const filas = within(solicitudes).getAllByRole('listitem');
    expect(filas).toHaveLength(3);
    expect(filas[1]).toHaveTextContent('Cambios de asesor1');
  });

  it('una cifra que falló muestra «—», nunca cero, y «Reintentar» repite la consulta', async () => {
    const user = userEvent.setup();
    const reintentar = vi.fn();
    vi.mocked(useConteos).mockImplementation((recursos) => ({
      valores: recursos.map((recurso) => (recurso === 'fichas-coordinador' ? undefined : 1)),
      total: undefined,
      cargando: false,
      hayError: recursos.includes('fichas-coordinador'),
      reintentar,
    }));

    render(<CoordinadorView />);

    const resumen = screen.getByRole('region', { name: 'Resumen del programa' });
    expect(within(resumen).getByRole('link', { name: /Fichas de perfil/ })).toHaveTextContent('—');
    expect(screen.queryByText(/solicitudes recibidas\./)).not.toBeInTheDocument();
    await user.click(within(resumen).getByRole('button', { name: 'Reintentar' }));
    expect(reintentar).toHaveBeenCalled();
  });

  it('mientras cuenta muestra el esqueleto de cifras y el atajo navega a su módulo', async () => {
    const user = userEvent.setup();
    conteosMock({ cargando: true, total: undefined });
    render(
      <Routes>
        <Route path="/dashboard" element={<CoordinadorView />} />
        <Route path="/solicitudes" element={<p>Pantalla de solicitudes</p>} />
      </Routes>,
      { initialPath: '/dashboard' },
    );

    expect(screen.getAllByRole('status')).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Responder solicitudes' }));

    expect(screen.getByText('Pantalla de solicitudes')).toBeInTheDocument();
  });
});
