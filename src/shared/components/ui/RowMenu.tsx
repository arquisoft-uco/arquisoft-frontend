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
  const [ancla, setAncla] = useState<DOMRect | null>(null);

  const cerrar = useCallback((devolverFoco: boolean) => {
    setAncla(null);
    if (devolverFoco) disparador.current?.focus();
  }, []);

  function alternar() {
    if (ancla) cerrar(true);
    else setAncla(disparador.current?.getBoundingClientRect() ?? null);
  }

  return (
    <>
      <IconButton
        ref={disparador}
        etiqueta={etiqueta}
        icono={Ellipsis}
        aria-haspopup="menu"
        aria-expanded={ancla !== null}
        aria-controls={ancla ? idMenu : undefined}
        onClick={alternar}
      />
      {ancla && (
        <RowMenuLista
          id={idMenu}
          etiqueta={etiqueta}
          acciones={acciones}
          ancla={ancla}
          disparador={disparador}
          onCerrar={cerrar}
        />
      )}
    </>
  );
}
