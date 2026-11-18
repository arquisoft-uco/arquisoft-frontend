import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../test-utils/render';
import { toast } from '../../../shared/hooks/useToast';
import type { Documentacion } from '../models/Documentacion';
import { copiarAlPortapapeles } from '../utils/copiar-al-portapapeles';
import EnlaceCompartirDocumentacionPanel from './EnlaceCompartirDocumentacionPanel';

vi.mock('../utils/copiar-al-portapapeles', () => ({ copiarAlPortapapeles: vi.fn() }));
vi.mock('../../../shared/hooks/useToast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const DOCUMENTACION: Documentacion = {
  id: 'd-1',
  tituloProyecto: 'Sistema de riego',
  autores: [],
  fechaPublicacion: '2026-11-01T10:00:00Z',
  entregableProyectoGrado: { id: 'e-1', versionEntregable: 3 },
  bibliotecario: { id: 'b-1', nombre: 'Laura Gómez' },
  estadoDocumentacion: { id: 'PUBLICADO', nombre: 'Publicado' },
};
const ENLACE = { url: 'https://s3.test/d', expiraEn: '2026-11-17T10:00:00Z' };

function renderizar() {
  const onCerrar = vi.fn();
  render(
    <EnlaceCompartirDocumentacionPanel
      documentacion={DOCUMENTACION}
      enlace={ENLACE}
      onCerrar={onCerrar}
    />,
  );
  return onCerrar;
}

describe('EnlaceCompartirDocumentacionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el enlace en un campo de solo lectura y el vencimiento', () => {
    // Act
    renderizar();

    // Assert
    const campo = screen.getByRole('textbox', { name: 'Enlace para compartir' });
    expect(campo).toHaveValue('https://s3.test/d');
    expect(campo).toHaveAttribute('readonly');
    expect(screen.getByText(/El enlace vence el/)).toBeInTheDocument();
  });

  it('"Copiar enlace" copia y avisa; si falla avisa cómo copiarlo a mano', async () => {
    // Arrange
    const user = userEvent.setup();
    vi.mocked(copiarAlPortapapeles).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Copiar enlace' }));

    // Assert
    expect(copiarAlPortapapeles).toHaveBeenCalledWith('https://s3.test/d');
    expect(toast.success).toHaveBeenCalledWith('Enlace copiado');

    // Act
    await user.click(screen.getByRole('button', { name: 'Copiar enlace' }));

    // Assert
    expect(toast.error).toHaveBeenCalledWith(
      'No se pudo copiar',
      'Selecciona el texto del campo y cópialo manualmente',
    );
  });

  it('"Cerrar" llama onCerrar', async () => {
    // Arrange
    const user = userEvent.setup();
    const onCerrar = renderizar();

    // Act
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    // Assert
    expect(onCerrar).toHaveBeenCalled();
  });
});
