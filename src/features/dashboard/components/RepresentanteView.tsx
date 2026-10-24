import { useFichasPorEvaluar } from '../hooks/useFichasPorEvaluar';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';
import BandejaFichasPanel from './representante/BandejaFichasPanel';
import CifrasFichasPanel from './representante/CifrasFichasPanel';

function fraseDeBandeja(total?: number): string | undefined {
  if (total === undefined) return undefined;
  if (total === 0) return 'No tienes fichas por evaluar.';
  return total === 1 ? 'Tienes 1 ficha por evaluar.' : `Tienes ${total} fichas por evaluar.`;
}

export default function RepresentanteView() {
  const { totalPorEvaluar } = useFichasPorEvaluar();

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={fraseDeBandeja(totalPorEvaluar)} />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <BandejaFichasPanel />
        </div>
        <div className={COLUMNA_LATERAL}>
          <CifrasFichasPanel />
        </div>
      </div>
    </div>
  );
}
