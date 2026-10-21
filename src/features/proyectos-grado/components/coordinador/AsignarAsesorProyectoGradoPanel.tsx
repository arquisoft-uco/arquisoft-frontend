import { useState } from 'react';
import FormActions from '../../../../shared/components/ui/FormActions';
import SidePanel from '../../../../shared/components/ui/SidePanel';
import { toast } from '../../../../shared/hooks/useToast';
import { useAsignarAsesorProyectoGrado } from '../../hooks/useAsignarAsesorProyectoGrado';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';
import { mensajeErrorAsignacionAsesor } from '../../utils/errores-asignacion-asesor';
import AsignarAsesorProyectoGradoSeccion from './AsignarAsesorProyectoGradoSeccion';

const ID_FORMULARIO = 'form-asignar-asesor-proyecto-grado';

interface Props {
  proyectoGradoId: string;
  titulo: string;
  asesores: AsesorProyectoGrado[];
  finalizado: boolean;
  onCerrar: () => void;
}

export default function AsignarAsesorProyectoGradoPanel({
  proyectoGradoId,
  titulo,
  asesores,
  finalizado,
  onCerrar,
}: Props) {
  const [seleccion, setSeleccion] = useState('');
  const { mutate, isPending } = useAsignarAsesorProyectoGrado(proyectoGradoId);

  function enviar() {
    if (seleccion === '') return;
    mutate(seleccion, {
      onSuccess: () => {
        toast.success('Asesor asignado', 'El asesor se vinculó al proyecto de grado.');
        onCerrar();
      },
      onError: (err) => {
        toast.error('No se pudo asignar al asesor', mensajeErrorAsignacionAsesor(err));
      },
    });
  }

  return (
    <SidePanel
      titulo="Asignar asesor"
      descripcion={titulo}
      onCerrar={onCerrar}
      sucio={seleccion !== ''}
      ocupado={isPending}
      pie={(solicitarCierre) => (
        <FormActions
          accion="Asignar asesor"
          accionEnviando="Asignando…"
          formId={ID_FORMULARIO}
          sucio={seleccion !== ''}
          sinCambios={seleccion === ''}
          enviando={isPending}
          onCancelar={solicitarCierre}
        />
      )}
    >
      <AsignarAsesorProyectoGradoSeccion
        idFormulario={ID_FORMULARIO}
        asesores={asesores}
        finalizado={finalizado}
        seleccion={seleccion}
        onCambiar={setSeleccion}
        onEnviar={enviar}
      />
    </SidePanel>
  );
}
