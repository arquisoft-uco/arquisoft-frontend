import Avatar from '../../../../shared/components/ui/Avatar';
import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { useCompanerosProyectoGrado } from '../../hooks/useCompanerosProyectoGrado';
import type { CompaneroProyectoGrado } from '../../models/CompaneroProyectoGrado';

const LISTA = 'flex flex-col gap-3';
const IDENTIDAD = 'flex min-w-0 items-center gap-3';
const TEXTOS = 'flex min-w-0 flex-col';
const NOMBRE = 'block truncate font-semibold text-on-surface';
const SUBTEXTO = 'block truncate text-[13px] text-on-surface-secondary';

interface Props {
  proyectoGradoId: string;
}

function CompaneroIdentidad({ companero }: { companero: CompaneroProyectoGrado }) {
  return (
    <div className={IDENTIDAD}>
      <Avatar nombre={companero.nombre} />
      <div className={TEXTOS}>
        <span title={companero.nombre} className={NOMBRE}>
          {companero.nombre}
        </span>
        <span title={companero.email} className={SUBTEXTO}>
          {companero.email}
        </span>
      </div>
    </div>
  );
}

export default function CompanerosProyectoResumen({ proyectoGradoId }: Props) {
  const { data, isLoading, isError } = useCompanerosProyectoGrado(proyectoGradoId);

  if (isError) {
    return <Notice variante="peligro">No pudimos cargar los estudiantes del proyecto.</Notice>;
  }
  if (isLoading || !data) {
    return <Skeleton variante="lineas" etiqueta="Cargando los estudiantes del proyecto…" />;
  }

  return (
    <ul aria-label="Estudiantes del proyecto" className={LISTA}>
      {data.map((companero) => (
        <li key={companero.estudianteId} className="min-w-0">
          <CompaneroIdentidad companero={companero} />
        </li>
      ))}
    </ul>
  );
}
