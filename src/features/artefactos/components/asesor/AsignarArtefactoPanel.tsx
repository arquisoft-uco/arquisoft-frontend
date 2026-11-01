import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useAsignarArtefactoForm } from '../../hooks/useAsignarArtefactoForm';
import AsignarArtefactoForm from './AsignarArtefactoForm';

const ID_FORMULARIO = 'asignar-artefacto';

interface Props {
  onCerrar: () => void;
  onAsignado: () => void;
}

export default function AsignarArtefactoPanel({ onCerrar, onAsignado }: Props) {
  const asignar = useAsignarArtefactoForm({ onCerrar, onAsignado });

  return (
    <SidePanel
      titulo="Asignar artefacto"
      descripcion="Elige el proyecto de grado, la versión del repositorio y los estudiantes que lo recibirán."
      sucio={asignar.isDirty}
      ocupado={asignar.enviando}
      onCerrar={asignar.cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Asignar artefacto"
          accionEnviando="Asignando…"
          enviando={asignar.enviando}
          sucio={asignar.isDirty}
          sinCambios={asignar.catalogoNoDisponible}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <AsignarArtefactoForm asignar={asignar} idFormulario={ID_FORMULARIO} />
    </SidePanel>
  );
}
