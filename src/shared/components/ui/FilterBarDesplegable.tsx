import { useId, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useClicFuera } from '../../hooks/useClicFuera';
import Button from './Button';
import FilterBarPanel, { type AlineacionPanel } from './FilterBarPanel';
import type { OrdenFiltro, SeccionFiltro } from './FilterBarSecciones';

const ENVOLTURA = 'relative flex-1 sm:flex-none';

interface Props {
  icono: LucideIcon;
  texto: ReactNode;
  nombreAccesible?: string;
  secciones: SeccionFiltro[];
  orden?: OrdenFiltro;
  totalResultados?: number;
  hayAplicados: boolean;
  alineacion?: AlineacionPanel;
  titulo?: string;
  etiquetaPanel?: string;
}

export default function FilterBarDesplegable({
  icono,
  texto,
  nombreAccesible,
  secciones,
  orden,
  totalResultados,
  hayAplicados,
  alineacion,
  titulo,
  etiquetaPanel,
}: Props) {
  const idPanel = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);

  useClicFuera(abierto, [boton, panel], () => setAbierto(false));

  return (
    <div className={ENVOLTURA}>
      <Button
        ref={boton}
        variante="secundario"
        icono={icono}
        aria-label={nombreAccesible}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={abierto ? idPanel : undefined}
        onClick={() => setAbierto((previo) => !previo)}
        className="w-full sm:w-auto"
      >
        {texto}
      </Button>
      {abierto && (
        <FilterBarPanel
          id={idPanel}
          ref={panel}
          retorno={boton}
          secciones={secciones}
          orden={orden}
          totalResultados={totalResultados}
          hayAplicados={hayAplicados}
          alineacion={alineacion}
          titulo={titulo}
          etiqueta={etiquetaPanel}
          onCerrar={() => setAbierto(false)}
        />
      )}
    </div>
  );
}
