import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { LIMITES } from '../../../../shared/validation';
import { useNuevaFichaForm } from '../../hooks/useNuevaFichaForm';
import NuevaFichaForm from './NuevaFichaForm';

const ID_FORMULARIO = 'registrar-ficha-perfil';

interface Props {
  onCerrar: () => void;
}

export default function RegistrarFichaPerfilPanel({ onCerrar }: Props) {
  const nueva = useNuevaFichaForm({ onCerrar });

  return (
    <SidePanel
      titulo="Nueva ficha de perfil"
      descripcion={`Define el proyecto, elige al asesor y agrega hasta ${LIMITES.ESTUDIANTES_MAX} estudiantes.`}
      sucio={nueva.isDirty}
      ocupado={nueva.enviando}
      onCerrar={nueva.cerrar}
      pie={(solicitarCierre) => (
        <FormActions
          formId={ID_FORMULARIO}
          accion="Registrar ficha"
          accionEnviando="Registrando…"
          enviando={nueva.enviando}
          sucio={nueva.isDirty}
          sinCambios={nueva.catalogoNoDisponible}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <NuevaFichaForm nueva={nueva} idFormulario={ID_FORMULARIO} />
    </SidePanel>
  );
}
