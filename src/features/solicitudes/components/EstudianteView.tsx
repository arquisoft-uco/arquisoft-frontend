import PageHeader from '../../../shared/components/ui/PageHeader';
import EnviarSolicitudNovedadForm from './estudiante/EnviarSolicitudNovedadForm';

export default function EstudianteView() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        titulo="Solicitudes"
        descripcion="Envía una solicitud de novedad al coordinador de tu proyecto."
      />

      <EnviarSolicitudNovedadForm />
    </div>
  );
}
