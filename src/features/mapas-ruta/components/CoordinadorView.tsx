import { useState } from 'react';
import { Map, Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import EmptyState from '../../../shared/components/ui/EmptyState';
import PageHeader from '../../../shared/components/ui/PageHeader';
import RegistrarMapaRutaPanel from './coordinador/RegistrarMapaRutaPanel';

export default function CoordinadorView() {
  const [registrando, setRegistrando] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Mapas de ruta"
        descripcion="Define las fechas importantes de cada proyecto en proceso."
        acciones={
          <Button icono={Plus} onClick={() => setRegistrando(true)}>
            Nuevo mapa de ruta
          </Button>
        }
      />
      <EmptyState
        icono={Map}
        titulo="Aún no hay datos"
        descripcion="Elige un proyecto en proceso y define sus fechas de inicio y de fin."
      />
      {registrando && <RegistrarMapaRutaPanel onCerrar={() => setRegistrando(false)} />}
    </div>
  );
}
