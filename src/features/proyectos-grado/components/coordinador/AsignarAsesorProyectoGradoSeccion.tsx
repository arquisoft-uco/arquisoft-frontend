import type { SyntheticEvent } from 'react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useAsesoresVigentes } from '../../../../shared/hooks/useAsesoresVigentes';
import type { AsesorProyectoGrado } from '../../models/AsesorProyectoGrado';
import { hayAsesorAsignado, opcionesAsesor } from '../../utils/cupo-asesor';

interface Props {
  idFormulario: string;
  asesores: AsesorProyectoGrado[];
  soloLectura: boolean;
  seleccion: string;
  onCambiar: (id: string) => void;
  onEnviar: () => void;
}

export default function AsignarAsesorProyectoGradoSeccion({
  idFormulario,
  asesores,
  soloLectura,
  seleccion,
  onCambiar,
  onEnviar,
}: Props) {
  const { data: vigentes = [], isLoading, isError } = useAsesoresVigentes();
  const opciones = opcionesAsesor(vigentes);

  function enviar(e: SyntheticEvent) {
    e.preventDefault();
    onEnviar();
  }

  function contenido() {
    if (soloLectura) {
      return (
        <Notice variante="info">
          Este proyecto de grado está finalizado o cancelado y no admite nuevos asesores.
        </Notice>
      );
    }
    if (isLoading) return <Skeleton variante="lineas" etiqueta="Cargando asesores…" />;
    if (isError) return <AvisoNoDisponible recurso="asesores" />;
    if (hayAsesorAsignado(asesores)) {
      return (
        <Notice variante="info">
          Este proyecto ya tiene un asesor asignado. Para asignar a otro, primero debe finalizarse
          la participación del actual.
        </Notice>
      );
    }
    if (opciones.length === 0) {
      return <Notice variante="info">No hay asesores vigentes disponibles para asignar.</Notice>;
    }
    return (
      <form id={idFormulario} onSubmit={enviar}>
        <Field etiqueta="Asesor">
          {(control) => (
            <Combobox
              {...control}
              valor={seleccion}
              onCambiar={onCambiar}
              opciones={opciones}
              etiquetaElegidos="Asesor elegido"
              textoVacio="No hay asesores que coincidan."
              placeholder="Busca por nombre o correo"
            />
          )}
        </Field>
      </form>
    );
  }

  return <FormSection titulo="Asignar asesor">{contenido()}</FormSection>;
}
