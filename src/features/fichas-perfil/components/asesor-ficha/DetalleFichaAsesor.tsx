import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FichaPerfilAsesor } from '../../models/FichaPerfilAsesor';
import ComingSoon from '../../../../shared/components/ComingSoon';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Tabs from '../../../../shared/components/ui/Tabs';
import ItemsFichaAsesorPanel from './ItemsFichaAsesorPanel';
import EstadosFichaPanel from '../EstadosFichaPanel';
import TiposItemPanel from '../TiposItemPanel';

type Tab = 'items' | 'estados' | 'revisiones' | 'evaluaciones' | 'tipos-item';

const TABS: { id: Tab; etiqueta: string }[] = [
  { id: 'items', etiqueta: 'Ítems' },
  { id: 'estados', etiqueta: 'Estados' },
  { id: 'revisiones', etiqueta: 'Revisiones' },
  { id: 'evaluaciones', etiqueta: 'Evaluaciones' },
  { id: 'tipos-item', etiqueta: 'Tipos de ítem' },
];

interface Props {
  ficha: FichaPerfilAsesor;
  onVolver: () => void;
  onEstadoCambiado?: (nuevoEstado: string) => void;
}

export default function DetalleFichaAsesor({ ficha, onVolver, onEstadoCambiado }: Props) {
  const [tab, setTab] = useState<Tab>('items');
  const [estadoActual, setEstadoActual] = useState(ficha.estadoActual);

  const handleEstadoCambiado = (nuevoEstado: string) => {
    setEstadoActual(nuevoEstado);
    onEstadoCambiado?.(nuevoEstado);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="flex flex-wrap items-center gap-3">
        <Button variante="secundario" icono={ChevronLeft} onClick={onVolver}>
          Volver
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-on-surface">{ficha.titulo}</h2>
          {estadoActual && <Badge variante="neutro">{estadoActual}</Badge>}
        </div>
      </header>

      <Tabs items={TABS} valor={tab} onCambiar={setTab} etiqueta="Secciones de la ficha">
        {tab === 'items' && <ItemsFichaAsesorPanel fichaPerfilId={ficha.id} />}
        {tab === 'estados' && (
          <EstadosFichaPanel
            fichaPerfilId={ficha.id}
            estadoActual={estadoActual}
            onEstadoCambiado={handleEstadoCambiado}
          />
        )}
        {tab === 'revisiones' && (
          <ComingSoon
            title="Revisiones"
            description="Las revisiones de la ficha estarán disponibles próximamente."
          />
        )}
        {tab === 'evaluaciones' && (
          <ComingSoon
            title="Evaluaciones"
            description="Las evaluaciones de la ficha estarán disponibles próximamente."
          />
        )}
        {tab === 'tipos-item' && <TiposItemPanel />}
      </Tabs>
    </div>
  );
}
