import { useCallback, useId, useRef, useState } from 'react';
import { Ellipsis } from 'lucide-react';
import IconButton from './IconButton';
import RowMenuLista from './RowMenuLista';
import type { AccionMenu } from './RowMenuLista';

export type { AccionMenu } from './RowMenuLista';

interface Props {
  etiqueta: string;
  acciones: AccionMenu[];
}

export default function RowMenu({ etiqueta, acciones }: Props) {
  const idMenu = useId();
  const disparador = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState<{ ancla: DOMRect; contenedor: HTMLElement } | null>(null);

  const cerrar = useCallback((devolverFoco: boolean) => {
    setAbierto(null);
    if (devolverFoco) disparador.current?.focus();
  }, []);

  function alternar() {
    const boton = disparador.current;
    if (abierto) cerrar(true);
    else if (boton) {
      const contenedor = boton.closest<HTMLElement>('[aria-modal="true"]') ?? document.body;
      setAbierto({ ancla: boton.getBoundingClientRect(), contenedor });
    }
  }

  return (
    <>
      <IconButton
        ref={disparador}
        etiqueta={etiqueta}
        icono={Ellipsis}
        aria-haspopup="menu"
        aria-expanded={abierto !== null}
        aria-controls={abierto ? idMenu : undefined}
        onClick={alternar}
      />
      {abierto && (
        <RowMenuLista
          id={idMenu}
          etiqueta={etiqueta}
          acciones={acciones}
          ancla={abierto.ancla}
          contenedor={abierto.contenedor}
          disparador={disparador}
          onCerrar={cerrar}
        />
      )}
    </>
  );
}
