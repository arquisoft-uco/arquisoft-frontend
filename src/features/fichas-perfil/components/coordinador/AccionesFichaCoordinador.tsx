import { useState } from 'react';
import { UserCog, Users } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import type { Asesor } from '../../../../shared/models/Asesor';
import type { ResumenFicha } from '../../models/ResumenFicha';
import { admiteDecision } from '../../utils/decision-ficha';
import CambiarAsesorPanel from './CambiarAsesorPanel';
import DecidirFichaAcciones from './DecidirFichaAcciones';
import EstudiantesVinculadosPanel from './EstudiantesVinculadosPanel';

interface Props {
  resumen: ResumenFicha;
  onAsesorCambiado: (asesor: Asesor) => void;
}

export default function AccionesFichaCoordinador({ resumen, onAsesorCambiado }: Props) {
  const [panel, setPanel] = useState<'estudiantes' | 'asesor' | null>(null);

  function cerrarPanel() {
    setPanel(null);
  }

  return (
    <>
      {admiteDecision(resumen.estadoId) && <DecidirFichaAcciones fichaPerfilId={resumen.id} />}
      <Button variante="secundario" icono={Users} onClick={() => setPanel('estudiantes')}>
        Ver estudiantes
      </Button>
      <Button variante="secundario" icono={UserCog} onClick={() => setPanel('asesor')}>
        Cambiar asesor
      </Button>
      {panel === 'estudiantes' && (
        <EstudiantesVinculadosPanel
          fichaId={resumen.id}
          titulo={resumen.titulo}
          onCerrar={cerrarPanel}
        />
      )}
      {panel === 'asesor' && (
        <CambiarAsesorPanel
          fichaId={resumen.id}
          titulo={resumen.titulo}
          asesorActual={{
            id: resumen.asesorId,
            nombre: resumen.asesorNombre,
            email: resumen.asesorEmail,
          }}
          onCerrar={cerrarPanel}
          onAsesorCambiado={onAsesorCambiado}
        />
      )}
    </>
  );
}
