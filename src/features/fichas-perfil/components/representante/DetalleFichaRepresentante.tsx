import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FichaPerfilRepresentante } from '../../models/FichaPerfilRepresentante';
import Badge from '../../../../shared/components/ui/Badge';
import Button from '../../../../shared/components/ui/Button';
import Tabs from '../../../../shared/components/ui/Tabs';
import ItemsFichaRepresentantePanel from './ItemsFichaRepresentantePanel';
import RegistrarEvaluacionPanel from './RegistrarEvaluacionPanel';
import TiposItemPanel from '../TiposItemPanel';

type Tab = 'items' | 'evaluaciones' | 'tipos-item';

const TABS: { id: Tab; etiqueta: string }[] = [
  { id: 'items', etiqueta: 'Ítems' },
  { id: 'evaluaciones', etiqueta: 'Evaluaciones' },
  { id: 'tipos-item', etiqueta: 'Tipos de ítem' },
];

interface Props {
  ficha: FichaPerfilRepresentante;
  onVolver: () => void;
}

export default function DetalleFichaRepresentante({ ficha, onVolver }: Props) {
  const [tab, setTab] = useState<Tab>('items');

  return (
    <div className="space-y-6 animate-fade-up">
      <header className="flex flex-wrap items-center gap-3">
        <Button variante="secundario" icono={ChevronLeft} onClick={onVolver}>
          Volver
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-on-surface">{ficha.titulo}</h2>
          <Badge variante="neutro">{ficha.estadoActual}</Badge>
        </div>
      </header>

      <Tabs items={TABS} valor={tab} onCambiar={setTab} etiqueta="Secciones de la ficha">
        {tab === 'items' && <ItemsFichaRepresentantePanel fichaPerfilId={ficha.id} />}
        {tab === 'evaluaciones' && <RegistrarEvaluacionPanel fichaPerfilId={ficha.id} />}
        {tab === 'tipos-item' && <TiposItemPanel />}
      </Tabs>
    </div>
  );
}
