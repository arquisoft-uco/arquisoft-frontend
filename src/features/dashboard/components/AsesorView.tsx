import { BookOpen, ClipboardList, Map } from 'lucide-react';
import { useArtefactosSinAvance } from '../hooks/useArtefactosSinAvance';
import { contarEnFrase } from '../utils/frase-conteo';
import ArtefactosSinAvancePanel from './asesor/ArtefactosSinAvancePanel';
import AtajosPanel, { type Atajo } from './AtajosPanel';
import CifrasPanel, { type Cifra } from './CifrasPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

const RESUMEN: readonly Cifra[] = [
  { recurso: 'proyectos-asesor', etiqueta: 'Proyectos asesorados', destino: '/proyectos-grado' },
  { recurso: 'artefactos-asesor', etiqueta: 'Artefactos asignados', destino: '/artefactos' },
  { recurso: 'entregables-asesor', etiqueta: 'Entregables', destino: '/entregables' },
  { recurso: 'evaluaciones-asesor', etiqueta: 'Evaluaciones asignadas', destino: '/evaluaciones' },
];

const ATAJOS: readonly Atajo[] = [
  { etiqueta: 'Ver mapas de ruta', icono: Map, destino: '/mapas-ruta' },
  { etiqueta: 'Responder solicitudes', icono: ClipboardList, destino: '/solicitudes' },
  { etiqueta: 'Consultar la biblioteca', icono: BookOpen, destino: '/biblioteca' },
];

const SOLICITUDES: readonly Cifra[] = [
  {
    recurso: 'solicitudes-novedad-asesor-recibidas',
    etiqueta: 'Novedades recibidas',
    destino: '/solicitudes',
  },
];

function fraseDeAvance(total: number | undefined, dias: number): string | undefined {
  if (total === undefined) return undefined;
  if (total === 0) return 'Tus artefactos tienen avance reciente.';
  const artefactos = contarEnFrase(total, 'artefacto', 'artefactos');
  return `Tienes ${artefactos} sin avance en más de ${dias} días.`;
}

export default function AsesorView() {
  const { total, dias } = useArtefactosSinAvance();

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={fraseDeAvance(total, dias)} />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <ArtefactosSinAvancePanel />
          <CifrasPanel titulo="Solicitudes" cifras={SOLICITUDES} disposicion="lista" />
        </div>
        <div className={COLUMNA_LATERAL}>
          <CifrasPanel titulo="Resumen" cifras={RESUMEN} />
          <AtajosPanel atajos={ATAJOS} />
        </div>
      </div>
    </div>
  );
}
