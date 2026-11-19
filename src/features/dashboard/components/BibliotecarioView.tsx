import { BookOpen } from 'lucide-react';
import { useEntregablesPorPublicar } from '../hooks/useEntregablesPorPublicar';
import { contarEnFrase } from '../utils/frase-conteo';
import AtajosPanel, { type Atajo } from './AtajosPanel';
import EntregablesPorPublicarPanel from './bibliotecario/EntregablesPorPublicarPanel';
import CifrasPanel, { type Cifra } from './CifrasPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

const RESUMEN: readonly Cifra[] = [
  { recurso: 'documentaciones', etiqueta: 'Documentos en la biblioteca', destino: '/biblioteca' },
  {
    recurso: 'entregables-por-publicar',
    etiqueta: 'Entregables por publicar',
    destino: '/biblioteca/disponibles',
  },
];

const ATAJOS: readonly Atajo[] = [
  { etiqueta: 'Consultar la biblioteca', icono: BookOpen, destino: '/biblioteca' },
];

function fraseDeEntregables(total?: number): string | undefined {
  if (total === undefined) return undefined;
  if (total === 0) return 'No hay entregables por publicar.';
  const entregables = contarEnFrase(total, 'entregable', 'entregables');
  return `Hay ${entregables} por publicar en la biblioteca.`;
}

export default function BibliotecarioView() {
  const { total } = useEntregablesPorPublicar();

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={fraseDeEntregables(total)} />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <EntregablesPorPublicarPanel />
        </div>
        <div className={COLUMNA_LATERAL}>
          <CifrasPanel titulo="Resumen" cifras={RESUMEN} />
          <AtajosPanel atajos={ATAJOS} />
        </div>
      </div>
    </div>
  );
}
