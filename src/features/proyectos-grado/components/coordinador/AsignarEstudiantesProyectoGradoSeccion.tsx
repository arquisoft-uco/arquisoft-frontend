import type { SyntheticEvent } from 'react';
import AvisoNoDisponible from '../../../../shared/components/AvisoNoDisponible';
import Combobox from '../../../../shared/components/ui/Combobox';
import Field from '../../../../shared/components/ui/Field';
import FormSection from '../../../../shared/components/ui/FormSection';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useEstudiantesVigentes } from '../../../../shared/hooks/useEstudiantesVigentes';
import { LIMITES } from '../../../../shared/validation';
import type { EstudianteProyectoGrado } from '../../models/EstudianteProyectoGrado';
import { candidatosAsignables, cupoDisponible } from '../../utils/cupo-estudiantes';

interface Props {
  idFormulario: string;
  vinculados: EstudianteProyectoGrado[];
  soloLectura: boolean;
  seleccion: string[];
  onCambiar: (ids: string[]) => void;
  onEnviar: () => void;
}

export default function AsignarEstudiantesProyectoGradoSeccion({
  idFormulario,
  vinculados,
  soloLectura,
  seleccion,
  onCambiar,
  onEnviar,
}: Props) {
  const { data: vigentes = [], isLoading, isError } = useEstudiantesVigentes();
  const cupo = cupoDisponible(vinculados);
  const opciones = candidatosAsignables(vigentes, vinculados);

  function enviar(e: SyntheticEvent) {
    e.preventDefault();
    onEnviar();
  }

  function contenido() {
    if (soloLectura) {
      return (
        <Notice variante="info">
          Este proyecto de grado está finalizado o cancelado y no admite nuevos estudiantes.
        </Notice>
      );
    }
    if (isLoading) return <Skeleton variante="lineas" etiqueta="Cargando estudiantes…" />;
    if (isError) return <AvisoNoDisponible recurso="estudiantes" />;
    if (cupo === 0) {
      return (
        <Notice variante="info">
          El proyecto ya tiene el máximo de {LIMITES.ESTUDIANTES_MAX} estudiantes vinculados.
        </Notice>
      );
    }
    if (opciones.length === 0) {
      return <Notice variante="info">No hay estudiantes vigentes disponibles para asignar.</Notice>;
    }
    return (
      <form id={idFormulario} onSubmit={enviar}>
        <Field etiqueta="Estudiantes a asignar" ayuda={`Puedes asignar hasta ${cupo}.`}>
          {(control) => (
            <Combobox
              {...control}
              multiple
              max={cupo}
              valor={seleccion}
              onCambiar={onCambiar}
              opciones={opciones}
              etiquetaElegidos="Estudiantes por asignar"
              textoVacio="No hay estudiantes que coincidan."
              placeholder="Busca por nombre o correo"
            />
          )}
        </Field>
      </form>
    );
  }

  return <FormSection titulo="Asignar estudiantes">{contenido()}</FormSection>;
}
