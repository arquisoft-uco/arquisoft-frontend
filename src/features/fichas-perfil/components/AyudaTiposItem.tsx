import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import SidePanel from '../../../shared/components/ui/SidePanel';
import TiposItemPanel from './TiposItemPanel';

export default function AyudaTiposItem() {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <Button
        variante="fantasma"
        tamano="sm"
        icono={CircleHelp}
        aria-haspopup="dialog"
        onClick={() => setAbierto(true)}
      >
        ¿Qué tipos de ítem existen?
      </Button>
      {abierto && (
        <SidePanel
          titulo="Tipos de ítem"
          descripcion="Los tipos que puede tener un ítem de la ficha."
          onCerrar={() => setAbierto(false)}
        >
          <TiposItemPanel />
        </SidePanel>
      )}
    </>
  );
}
