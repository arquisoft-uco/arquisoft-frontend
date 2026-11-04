import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../../shared/components/ui/Button';
import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarMapasRutaCoordinador from './coordinador/ConsultarMapasRutaCoordinador';
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
      <ConsultarMapasRutaCoordinador onNuevoMapa={() => setRegistrando(true)} />
      {registrando && <RegistrarMapaRutaPanel onCerrar={() => setRegistrando(false)} />}
    </div>
  );
}
