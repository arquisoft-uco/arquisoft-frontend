import FormActions from '../../../../shared/components/ui/FormActions';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import type { ArtefactoAsesor } from '../../models/ArtefactoAsesor';
import EstudiantesArtefactoLista from './EstudiantesArtefactoLista';
import VincularEstudiantesForm from './VincularEstudiantesForm';

const CONTENIDO = 'flex flex-col gap-6';
const AVISO_OMITIDO =
  'Este artefacto está omitido y no admite cambios de estudiantes. Reactívalo para modificarlos.';

interface Props {
  artefacto: ArtefactoAsesor;
  onCerrar: () => void;
}

export default function EstudiantesArtefactoPanel({ artefacto, onCerrar }: Props) {
  return (
    <SidePanel
      titulo="Estudiantes del artefacto"
      descripcion={`«${artefacto.nombreDocumento}» · ${artefacto.nombreProyecto}`}
      onCerrar={onCerrar}
      pie={(solicitarCierre) => (
        <FormActions nota="Los cambios se aplican al instante." onCancelar={solicitarCierre} />
      )}
    >
      <div className={CONTENIDO}>
        {artefacto.omitido && <Notice variante="info">{AVISO_OMITIDO}</Notice>}
        <EstudiantesArtefactoLista artefactoId={artefacto.id} omitido={artefacto.omitido} />
        {!artefacto.omitido && (
          <FormSection titulo="Vincular estudiantes">
            <VincularEstudiantesForm artefacto={artefacto} onSalir={onCerrar} />
          </FormSection>
        )}
      </div>
    </SidePanel>
  );
}
