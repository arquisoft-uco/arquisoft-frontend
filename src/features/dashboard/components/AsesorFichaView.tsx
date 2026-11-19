import { useFichasAsesoradas } from '../hooks/useFichasAsesoradas';
import { contarEnFrase } from '../utils/frase-conteo';
import FichasAsesoradasPanel from './asesor-ficha/FichasAsesoradasPanel';
import CifrasPanel, { type Cifra } from './CifrasPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

const RESUMEN: readonly Cifra[] = [
  { recurso: 'fichas-asesor', etiqueta: 'Fichas asesoradas', destino: '/fichas-perfil' },
  {
    recurso: 'evaluaciones-fichas-asesor',
    etiqueta: 'Evaluaciones de fichas',
    destino: '/fichas-perfil?vista=evaluaciones',
  },
];

function fraseDeFichas(total?: number): string | undefined {
  if (total === undefined) return undefined;
  if (total === 0) return 'Aún no asesoras fichas de perfil.';
  return `Asesoras ${contarEnFrase(total, 'ficha de perfil', 'fichas de perfil')}.`;
}

export default function AsesorFichaView() {
  const { total } = useFichasAsesoradas();

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={fraseDeFichas(total)} />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <FichasAsesoradasPanel />
        </div>
        <div className={COLUMNA_LATERAL}>
          <CifrasPanel titulo="Resumen" cifras={RESUMEN} />
        </div>
      </div>
    </div>
  );
}
