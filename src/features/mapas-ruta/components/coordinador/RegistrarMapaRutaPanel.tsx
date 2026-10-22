import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { useRegistrarMapaRutaForm } from '../../hooks/useRegistrarMapaRutaForm';
import RegistrarMapaRutaForm from './RegistrarMapaRutaForm';

const ID_FORMULARIO = 'registrar-mapa-ruta';

interface Props {
  onCerrar: () => void;
}

export default function RegistrarMapaRutaPanel({ onCerrar }: Props) {
  const registro = useRegistrarMapaRutaForm({ onCerrar });

  return (
    <SidePanel
      titulo="Nuevo mapa de ruta"
      descripcion="Elige un proyecto en proceso y define sus fechas de inicio y de fin."
      sucio={registro.isDirty}
      ocupado={registro.enviando}
      onCerrar={registro.cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Crear mapa de ruta"
          accionEnviando="Creando…"
          enviando={registro.enviando}
          sucio={registro.isDirty}
          sinCambios={registro.catalogoNoDisponible}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <RegistrarMapaRutaForm registro={registro} idFormulario={ID_FORMULARIO} />
    </SidePanel>
  );
}
