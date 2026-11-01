import ErrorSummary from '../../../../shared/components/ui/ErrorSummary';
import type { useAsignarArtefactoForm } from '../../hooks/useAsignarArtefactoForm';
import type { ArtefactoAReactivar } from '../../models/ArtefactoAReactivar';
import AsignarArtefactoDestinoSeccion from './AsignarArtefactoDestinoSeccion';
import AsignarArtefactoEstudiantesSeccion from './AsignarArtefactoEstudiantesSeccion';
import ReactivarArtefactoDestino from './ReactivarArtefactoDestino';

interface Props {
  asignar: ReturnType<typeof useAsignarArtefactoForm>;
  idFormulario: string;
  reactivar?: ArtefactoAReactivar;
}

export default function AsignarArtefactoForm({ asignar, idFormulario, reactivar }: Props) {
  const { form, enviar, enviando, catalogos } = asignar;

  return (
    <form
      id={idFormulario}
      aria-label="Asignación de artefacto"
      noValidate
      aria-busy={enviando}
      onSubmit={enviar}
      className="flex flex-col gap-6"
    >
      {reactivar ? (
        <ReactivarArtefactoDestino artefacto={reactivar} />
      ) : (
        <AsignarArtefactoDestinoSeccion
          control={form.control}
          proyectos={catalogos.proyectos}
          versiones={catalogos.versiones}
          onCambiarProyecto={asignar.alCambiarProyecto}
        />
      )}
      <AsignarArtefactoEstudiantesSeccion control={form.control} catalogo={catalogos.estudiantes} />
      <ErrorSummary errores={asignar.errores} onIrAlCampo={asignar.irAlCampo} />
    </form>
  );
}
