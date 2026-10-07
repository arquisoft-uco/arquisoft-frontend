import type { ComponentProps } from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../test-utils/render';
import DataTable from './DataTable';
import type { ColumnaTabla, OrdenTabla } from './DataTable';

interface Persona {
  id: string;
  nombre: string;
  documento: string;
  ciudad: string;
}

const MARTA: Persona = { id: 'p-1', nombre: 'Marta Ríos', documento: '2001', ciudad: 'Bogotá' };
const LUIS: Persona = { id: 'p-2', nombre: 'Luis Pardo', documento: '2002', ciudad: 'Cali' };

const COLUMNAS: ColumnaTabla<Persona>[] = [
  { id: 'nombre', encabezado: 'Nombre', ordenable: true, celda: (persona) => persona.nombre },
  {
    id: 'documento',
    encabezado: 'Documento',
    clave: 'identificador',
    ordenable: true,
    celda: (persona) => persona.documento,
  },
  { id: 'ciudad', encabezado: 'Ciudad', celda: (persona) => persona.ciudad },
];

function crearTabla(props: Partial<ComponentProps<typeof DataTable<Persona>>> = {}) {
  return (
    <DataTable
      etiqueta="Personas"
      columnas={COLUMNAS}
      filas={[MARTA, LUIS]}
      idDeFila={(persona) => persona.id}
      tarjeta={(persona) => <p>{`Tarjeta de ${persona.nombre}`}</p>}
      {...props}
    />
  );
}

function renderizar(props: Partial<ComponentProps<typeof DataTable<Persona>>> = {}) {
  return render(crearTabla(props));
}

describe('DataTable', () => {
  it('la cabecera ordenable pone aria-sort y llama a onOrdenar con la dirección que sigue', async () => {
    // Arrange
    const user = userEvent.setup();
    const onOrdenar = vi.fn();
    const ordenInicial: OrdenTabla = { clave: 'nombre', direccion: 'ASC' };
    const { rerender } = renderizar({ orden: ordenInicial, onOrdenar });
    const nombre = screen.getByRole('columnheader', { name: 'Nombre' });
    const documento = screen.getByRole('columnheader', { name: 'Documento' });
    const ciudad = screen.getByRole('columnheader', { name: 'Ciudad' });

    // Assert
    expect(nombre).toHaveAttribute('aria-sort', 'ascending');
    expect(documento).toHaveAttribute('aria-sort', 'none');
    expect(ciudad).not.toHaveAttribute('aria-sort');
    expect(within(ciudad).queryByRole('button')).not.toBeInTheDocument();

    // Act
    await user.click(within(nombre).getByRole('button', { name: 'Nombre' }));
    await user.click(within(documento).getByRole('button', { name: 'Documento' }));

    // Assert
    expect(onOrdenar).toHaveBeenNthCalledWith(1, 'nombre', 'DESC');
    expect(onOrdenar).toHaveBeenNthCalledWith(2, 'identificador', 'ASC');

    // Act
    rerender(crearTabla({ orden: { clave: 'nombre', direccion: 'DESC' }, onOrdenar }));
    await user.click(within(nombre).getByRole('button', { name: 'Nombre' }));

    // Assert
    expect(nombre).toHaveAttribute('aria-sort', 'descending');
    expect(onOrdenar).toHaveBeenNthCalledWith(3, 'nombre', 'ASC');
  });

  it('sin filas muestra el vacío en lugar de la tabla', () => {
    // Act
    renderizar({ filas: [], vacio: <p>No hay personas</p> });

    // Assert
    expect(screen.getByText('No hay personas')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('con cargando muestra el esqueleto nombrado y no dibuja las filas', () => {
    // Act
    renderizar({ cargando: true });

    // Assert
    expect(screen.getByRole('status')).toHaveTextContent('Cargando personas…');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('Marta Ríos')).not.toBeInTheDocument();
  });

  it('con acciones, cada fila de la tabla y cada tarjeta exponen las mismas acciones', async () => {
    // Arrange
    const user = userEvent.setup();
    const alAbrir = vi.fn();
    const acciones = (persona: Persona) => (
      <button type="button" onClick={() => alAbrir(persona.id)}>
        {`Acciones de ${persona.nombre}`}
      </button>
    );
    renderizar({ acciones });
    const tabla = within(screen.getByRole('table', { name: 'Personas' }));
    const tarjetas = within(screen.getByRole('list', { name: 'Personas' }));

    // Assert
    expect(tabla.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument();
    expect(tabla.getAllByRole('row')).toHaveLength(3);
    expect(tabla.getByText('Bogotá')).toBeInTheDocument();
    expect(tarjetas.getAllByRole('listitem')).toHaveLength(2);
    expect(tarjetas.getByText('Tarjeta de Luis Pardo')).toBeInTheDocument();
    expect(tarjetas.queryByText('Bogotá')).not.toBeInTheDocument();
    for (const nombre of [MARTA.nombre, LUIS.nombre]) {
      expect(tabla.getByRole('button', { name: `Acciones de ${nombre}` })).toBeInTheDocument();
      expect(tarjetas.getByRole('button', { name: `Acciones de ${nombre}` })).toBeInTheDocument();
    }

    // Act
    await user.click(tarjetas.getByRole('button', { name: `Acciones de ${LUIS.nombre}` }));

    // Assert
    expect(alAbrir).toHaveBeenCalledWith(LUIS.id);
  });
});
