import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { render, screen } from '../test-utils/render';
import { resetAllStores } from '../test-utils/store.utils';
import { useProveedorStore } from '../auth/proveedorStore';
import { definicionDe } from '../auth/proveedores/proveedores';
import CapacidadGuard from './CapacidadGuard';

vi.mock('../auth/proveedores/proveedores', () => ({
  definicionDe: vi.fn(),
  proveedoresDisponibles: vi.fn(),
}));

function renderizar() {
  render(
    <Routes>
      <Route
        path="/seguridad"
        element={
          <CapacidadGuard capacidad="administracion-seguridad">
            <p>Contenido protegido</p>
          </CapacidadGuard>
        }
      />
      <Route path="/forbidden" element={<p>Acceso denegado</p>} />
    </Routes>,
    { initialPath: '/seguridad' },
  );
}

function proveedorConCapacidades(capacidades: Array<'administracion-seguridad'>) {
  vi.mocked(definicionDe).mockReturnValue({
    id: 'pdp',
    titulo: 'PDP',
    descripcion: '',
    capacidades,
    disponible: true,
    crear: vi.fn(),
  });
  useProveedorStore.setState({ proveedor: 'pdp' });
}

describe('CapacidadGuard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetAllStores();
  });

  it('renderiza el contenido si el proveedor ofrece la capacidad', () => {
    proveedorConCapacidades(['administracion-seguridad']);

    renderizar();

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it.each([
    ['el proveedor no la ofrece', () => proveedorConCapacidades([])],
    ['no hay proveedor recordado', () => undefined],
  ])('redirige a /forbidden si %s', (_caso, preparar) => {
    preparar();

    renderizar();

    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });
});
