import PageHeader from '../../../shared/components/ui/PageHeader';
import ConsultarArtefactosEstudiante from './estudiante/ConsultarArtefactosEstudiante';

export default function EstudianteView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Artefactos"
        descripcion="Consulta los artefactos de tus proyectos de grado y filtra por proyecto, documento, repositorio, asesor o versión."
      />
      <ConsultarArtefactosEstudiante />
    </div>
  );
}
