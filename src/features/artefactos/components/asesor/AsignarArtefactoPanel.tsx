import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useAsignarArtefactoForm } from '../../hooks/useAsignarArtefactoForm';
import type { ArtefactoAReactivar } from '../../models/ArtefactoAReactivar';
import AsignarArtefactoForm from './AsignarArtefactoForm';

const ID_FORMULARIO = 'asignar-artefacto';
const DESCRIPCION_ASIGNAR =
  'Elige el proyecto de grado, la versión del repositorio y los estudiantes que lo recibirán.';
const DESCRIPCION_REACTIVAR = 'Elige los estudiantes que recibirán el artefacto de nuevo.';

interface Props {
  onCerrar: () => void;
  onAsignado: () => void;
  reactivar?: ArtefactoAReactivar;
}

export default function AsignarArtefactoPanel({ onCerrar, onAsignado, reactivar }: Props) {
  const asignar = useAsignarArtefactoForm({ onCerrar, onAsignado, reactivar });

  return (
    <SidePanel
      titulo={reactivar ? 'Reactivar artefacto' : 'Asignar artefacto'}
      descripcion={reactivar ? DESCRIPCION_REACTIVAR : DESCRIPCION_ASIGNAR}
      sucio={asignar.isDirty}
      ocupado={asignar.enviando}
      onCerrar={asignar.cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion={reactivar ? 'Reactivar artefacto' : 'Asignar artefacto'}
          accionEnviando={reactivar ? 'Reactivando…' : 'Asignando…'}
          enviando={asignar.enviando}
          sucio={asignar.isDirty}
          sinCambios={asignar.catalogoNoDisponible}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <AsignarArtefactoForm asignar={asignar} idFormulario={ID_FORMULARIO} reactivar={reactivar} />
    </SidePanel>
  );
}
