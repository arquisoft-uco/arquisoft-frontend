import type { Estudiante } from '../../models/Estudiante';
import { AsesorDeFicha } from '../FichaCeldas';

const LISTA = 'flex flex-col gap-3';
const VACIO = 'text-sm text-on-surface-secondary';

interface Props {
  integrantes: Estudiante[];
}

export default function CompanerosFichaPanel({ integrantes }: Props) {
  if (integrantes.length === 0) {
    return <p className={VACIO}>Aún no hay integrantes registrados.</p>;
  }

  return (
    <ul aria-label="Equipo de la ficha" className={LISTA}>
      {integrantes.map((integrante) => (
        <li key={integrante.id}>
          <AsesorDeFicha nombre={integrante.nombre} email={integrante.email} />
        </li>
      ))}
    </ul>
  );
}
