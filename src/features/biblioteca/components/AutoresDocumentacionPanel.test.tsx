import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import AutoresDocumentacionPanel from './AutoresDocumentacionPanel';
import { useAutoresDocumentacion } from '../hooks/useAutoresDocumentacion';
import type { AutorDocumentacion } from '../models/AutorDocumentacion';
import type { Documentacion } from '../models/Documentacion';

vi.mock('../hooks/useAutoresDocumentacion', () => ({
  useAutoresDocumentacion: vi.fn(),
}));

const DOCUMENTACION: Documentacion = {
  id: 'd-1',
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 2 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};

const AUTORES: AutorDocumentacion[] = [
  { id: 'a-1', identificador: 'AUT-01', nombre: 'Ana Pérez', email: 'ana@uco.edu.co' },
  { id: 'a-2', identificador: 'AUT-02', nombre: 'Bruno Díaz', email: 'bruno@uco.edu.co' },
];

function mockHook(parcial: Partial<ReturnType<typeof useAutoresDocumentacion>> = {}) {
  const hook = {
    data: undefined,
    error: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...parcial,
  } as ReturnType<typeof useAutoresDocumentacion>;
  vi.mocked(useAutoresDocumentacion).mockReturnValue(hook);
  return hook;
}

describe('AutoresDocumentacionPanel', () => {
  beforeEach(() => {
    vi.mocked(useAutoresDocumentacion).mockReset();
  });

  it('mientras carga muestra el estado de carga y consulta con el id de la documentación', () => {
    // Arrange
    mockHook({ isLoading: true });

    // Act
    render(<AutoresDocumentacionPanel documentacion={DOCUMENTACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(useAutoresDocumentacion).toHaveBeenCalledWith('d-1');
  });

  it('lista nombre, correo e identificador de cada autor y la versión en el encabezado', () => {
    // Arrange
    mockHook({ data: AUTORES });

    // Act
    render(<AutoresDocumentacionPanel documentacion={DOCUMENTACION} onCerrar={vi.fn()} />);

    // Assert
    const lista = within(screen.getByRole('list', { name: 'Autores de la documentación' }));
    expect(lista.getAllByRole('listitem')).toHaveLength(2);
    expect(lista.getByText('Ana Pérez')).toBeInTheDocument();
    expect(lista.getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(lista.getByText('AUT-02')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Versión 2');
  });

  it('con lista vacía muestra que no hay autores registrados', () => {
    // Arrange
    mockHook({ data: [] });

    // Act
    render(<AutoresDocumentacionPanel documentacion={DOCUMENTACION} onCerrar={vi.fn()} />);

    // Assert
    expect(screen.getByText('Esta documentación no tiene autores registrados')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('con error muestra la alerta y "Reintentar" vuelve a consultar', async () => {
    // Arrange
    const user = userEvent.setup();
    const hook = mockHook({ isError: true, error: new Error('fallo') });
    render(<AutoresDocumentacionPanel documentacion={DOCUMENTACION} onCerrar={vi.fn()} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));

    // Assert
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudieron cargar los autores');
    expect(hook.refetch).toHaveBeenCalledTimes(1);
  });

  it('el botón de cerrar llama a onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    mockHook({ data: AUTORES });
    render(<AutoresDocumentacionPanel documentacion={DOCUMENTACION} onCerrar={onCerrar} />);

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar panel' }));

    // Assert
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });
});
