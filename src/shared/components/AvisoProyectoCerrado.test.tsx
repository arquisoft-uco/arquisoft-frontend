import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test-utils/render';
import AvisoProyectoCerrado from './AvisoProyectoCerrado';

describe('AvisoProyectoCerrado', () => {
  it('cancelado tiene prioridad sobre finalizado y usa la cola por defecto', () => {
    // Act
    render(<AvisoProyectoCerrado proyectoCancelado proyectoFinalizado />);

    // Assert
    expect(screen.getByText(/Este proyecto fue cancelado\./)).toHaveTextContent(
      'Puedes consultar la información, pero ya no admite cambios ni descargas.',
    );
    expect(screen.queryByText(/está finalizado/)).not.toBeInTheDocument();
  });

  it('finalizado avisa y el detalle reemplaza la cola', () => {
    // Act
    render(
      <AvisoProyectoCerrado
        proyectoCancelado={false}
        proyectoFinalizado
        detalle="Consulta la pestaña Finalizados."
      />,
    );

    // Assert
    const aviso = screen.getByText(/Este proyecto está finalizado\./);
    expect(aviso).toHaveTextContent('Consulta la pestaña Finalizados.');
    expect(aviso).not.toHaveTextContent('ya no admite cambios ni descargas');
  });

  it('con el proyecto abierto no muestra nada', () => {
    // Act
    const { container } = render(
      <AvisoProyectoCerrado proyectoCancelado={false} proyectoFinalizado={false} />,
    );

    // Assert
    expect(container).toBeEmptyDOMElement();
  });
});
