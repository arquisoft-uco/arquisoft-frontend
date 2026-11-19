import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import SidePanel from '../../../shared/components/ui/SidePanel';
import EstadosDocumentacionPanel from './EstadosDocumentacionPanel';

export default function AyudaEstadosDocumentacion() {
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
        ¿Qué significa cada estado?
      </Button>
      {abierto && (
        <SidePanel
          titulo="Estados de una documentación"
          descripcion="Los estados por los que puede pasar una documentación en la biblioteca."
          onCerrar={() => setAbierto(false)}
        >
          <EstadosDocumentacionPanel />
        </SidePanel>
      )}
    </>
  );
}
