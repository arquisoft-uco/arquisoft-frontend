import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test-utils/render';
import FichasPerfilTable from './FichasPerfilTable';
import type { FichaPerfil } from '../../models/FichaPerfil';

vi.mock('./EstudiantesVinculadosPanel', () => ({
  default: ({ idFichaPerfil }: { idFichaPerfil: string }) => (
    <p>Panel de estudiantes de {idFichaPerfil}</p>
  ),
}));
vi.mock('./CambiarAsesorForm', () => ({
  default: ({
    idFichaPerfil,
    idAsesorActual,
    onExito,
  }: {
    idFichaPerfil: string;
    idAsesorActual: string;
    onExito?: () => void;
  }) => (
    <div>
      <p>
        Formulario de asesor de {idFichaPerfil} con asesor actual {idAsesorActual}
      </p>
      <button type="button" onClick={onExito}>
        Simular éxito
      </button>
    </div>
  ),
}));

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

function renderTabla(parcial: Partial<React.ComponentProps<typeof FichasPerfilTable>> = {}) {
  const onPageChange = vi.fn();
  render(
    <FichasPerfilTable
      fichas={[FICHA_ANA, FICHA_LUIS]}
      totalElements={2}
      totalPages={1}
      page={0}
      pageSize={10}
      onPageChange={onPageChange}
      {...parcial}
    />,
  );
  return { onPageChange };
}

describe('FichasPerfilTable', () => {
  it('muestra una fila por ficha con el título del proyecto y el nombre y correo del asesor', () => {
    renderTabla();

    // 1 fila de cabecera + 2 de datos
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Sistema de monitoreo')).toBeInTheDocument();
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('ana@uco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('Plataforma de tutorías')).toBeInTheDocument();
    expect(screen.getByText('Luis Gómez')).toBeInTheDocument();
    expect(screen.getByText('luis@uco.edu.co')).toBeInTheDocument();
  });

  it('muestra el mensaje de vacío cuando no hay fichas', () => {
    renderTabla({ fichas: [], totalElements: 0, totalPages: 0 });

    expect(screen.getByText('No hay fichas de perfil registradas.')).toBeInTheDocument();
  });

  it('no muestra el paginador cuando hay una sola página', () => {
    renderTabla({ totalPages: 1 });

    expect(screen.queryByRole('button', { name: 'Página siguiente' })).not.toBeInTheDocument();
  });

  it('en la primera página muestra el rango, deshabilita Anterior y Siguiente pide la página 1', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderTabla({ totalElements: 25, totalPages: 3, page: 0 });

    expect(screen.getByText('1–2 de 25 fichas')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('en la última página deshabilita Siguiente y Anterior pide la página previa', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderTabla({ totalElements: 22, totalPages: 3, page: 2 });

    expect(screen.getByText('21–22 de 22 fichas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('alterna el panel de estudiantes vinculados de la ficha con aria-expanded', async () => {
    const user = userEvent.setup();
    renderTabla({ fichas: [FICHA_ANA], totalElements: 1 });

    const abrir = screen.getByRole('button', { name: 'Ver estudiantes vinculados' });
    expect(abrir).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Panel de estudiantes de f-1')).not.toBeInTheDocument();

    await user.click(abrir);

    expect(screen.getByRole('button', { name: 'Ocultar estudiantes' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Panel de estudiantes de f-1')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ocultar estudiantes' }));

    expect(screen.queryByText('Panel de estudiantes de f-1')).not.toBeInTheDocument();
  });

  it('despliega el formulario de cambio de asesor solo de la fila elegida, con la ficha y el asesor actual, y lo cierra al terminar con éxito', async () => {
    const user = userEvent.setup();
    renderTabla();

    const [, abrirLuis] = screen.getAllByRole('button', { name: 'Cambiar asesor' });
    expect(abrirLuis).toHaveAttribute('aria-expanded', 'false');

    await user.click(abrirLuis);

    expect(
      screen.getByText('Formulario de asesor de f-2 con asesor actual a-2'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Formulario de asesor de f-1/)).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ocultar formulario de cambio de asesor' }),
    ).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: 'Simular éxito' }));

    expect(screen.queryByText(/Formulario de asesor de/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Cambiar asesor' })).toHaveLength(2);
  });

  it('mantiene independientes el formulario de cambio de asesor y el panel de estudiantes de la misma ficha', async () => {
    const user = userEvent.setup();
    renderTabla({ fichas: [FICHA_ANA], totalElements: 1 });

    await user.click(screen.getByRole('button', { name: 'Cambiar asesor' }));

    expect(screen.getByText(/Formulario de asesor de f-1/)).toBeInTheDocument();
    expect(screen.queryByText('Panel de estudiantes de f-1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ver estudiantes vinculados' }));

    expect(screen.getByText(/Formulario de asesor de f-1/)).toBeInTheDocument();
    expect(screen.getByText('Panel de estudiantes de f-1')).toBeInTheDocument();
  });
});
