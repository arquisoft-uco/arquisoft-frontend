import { Link } from 'react-router';
import Badge from '../../../../shared/components/ui/Badge';
import { Rol } from '../../../../shared/models/rol';
import { pasosRutaAcademica } from '../../utils/ruta-academica';
import { LISTA } from '../disposicion';
import SeccionInicio from '../SeccionInicio';

const PASOS = pasosRutaAcademica(Rol.Estudiante);

export default function RutaAcademicaPanel() {
  return (
    <SeccionInicio titulo="Tu ruta académica">
      <ol className={LISTA}>
        {PASOS.map((paso, indice) => (
          <li key={paso.path} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            {paso.disponible ? (
              <Link to={paso.path} className="font-medium text-primary hover:underline">
                {indice + 1}. {paso.label}
              </Link>
            ) : (
              <span className="text-on-surface-secondary">
                {indice + 1}. {paso.label}
              </span>
            )}
            <Badge variante={paso.disponible ? 'info' : 'neutro'}>
              {paso.disponible ? 'En curso' : 'Pronto'}
            </Badge>
          </li>
        ))}
      </ol>
    </SeccionInicio>
  );
}
