import Notice from '../../../../shared/components/ui/Notice';
import Skeleton from '../../../../shared/components/ui/Skeleton';
import { getApiErrorMessage } from '../../../../shared/utils/api-error';
import { useCompanerosFichaPerfil } from '../../hooks/useCompanerosFichaPerfil';
import { AsesorDeFicha } from '../FichaCeldas';

const LISTA = 'flex flex-col gap-3';
const VACIO = 'text-sm text-on-surface-secondary';

interface Props {
  idFichaPerfil: string;
}

export default function CompanerosFichaPanel({ idFichaPerfil }: Props) {
  const { data, isPending, isError, error, refetch } = useCompanerosFichaPerfil(idFichaPerfil);

  if (isPending) return <Skeleton variante="lineas" etiqueta="Cargando compañeros…" />;

  if (isError) {
    return (
      <Notice variante="peligro" accion={{ etiqueta: 'Reintentar', onClick: () => void refetch() }}>
        {getApiErrorMessage(error, 'No pudimos cargar a tus compañeros.')}
      </Notice>
    );
  }

  if (data.length === 0) {
    return <p className={VACIO}>No tienes compañeros vinculados a esta ficha.</p>;
  }

  return (
    <ul aria-label="Compañeros" className={LISTA}>
      {data.map((companero) => (
        <li key={companero.idVinculo}>
          <AsesorDeFicha nombre={companero.nombre} email={companero.email} />
        </li>
      ))}
    </ul>
  );
}
