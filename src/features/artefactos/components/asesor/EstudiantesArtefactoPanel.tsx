import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Button from '../../../../shared/components/ui/Button';
import FormActions from '../../../../shared/components/ui/FormActions';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import EstudiantesArtefactoLista from './EstudiantesArtefactoLista';
import VincularEstudiantesPanel from './VincularEstudiantesPanel';

const BARRA = 'mb-4 flex justify-end';
const AVISO_OMITIDO =
  'Este artefacto está omitido y no admite cambios de estudiantes. Reactívalo para modificarlos.';

interface Props {
  artefacto: ArtefactoAsesor;
  onCerrar: () => void;
}

export default function EstudiantesArtefactoPanel({ artefacto, onCerrar }: Props) {
  const [vinculando, setVinculando] = useState(false);

  if (vinculando) {
    return (
      <VincularEstudiantesPanel
        artefacto={artefacto}
        onVolver={() => setVinculando(false)}
        onSalir={onCerrar}
      />
    );
  }

  return (
    <SidePanel
      titulo="Estudiantes del artefacto"
      descripcion={`«${artefacto.nombreDocumento}» · ${artefacto.nombreProyecto}`}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <FormActions nota="Los cambios se aplican al instante." onCancelar={solicitarCierre} />
      )}
    >
      {artefacto.omitido ? (
        <Notice variante="info" className="mb-4">
          {AVISO_OMITIDO}
        </Notice>
      ) : (
        <div className={BARRA}>
          <Button icono={UserPlus} onClick={() => setVinculando(true)}>
            Vincular estudiantes
          </Button>
        </div>
      )}
      <EstudiantesArtefactoLista artefactoId={artefacto.id} omitido={artefacto.omitido} />
    </SidePanel>
  );
}
