import EnviarSolicitudNovedadForm from './estudiante/EnviarSolicitudNovedadForm';

export default function EstudianteView() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-xl font-bold text-on-surface sm:text-2xl">Solicitudes</h1>
        <p className="mt-1 text-sm text-on-surface-secondary">
          Envía una solicitud de novedad al coordinador de tu proyecto.
        </p>
      </header>

      <EnviarSolicitudNovedadForm />
    </div>
  );
}
