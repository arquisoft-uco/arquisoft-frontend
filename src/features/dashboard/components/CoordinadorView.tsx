import { BookOpen, ClipboardList, FileText } from 'lucide-react';
import { useConteos } from '../hooks/useConteos';
import { contarEnFrase } from '../utils/frase-conteo';
import AtajosPanel, { type Atajo } from './AtajosPanel';
import CifrasPanel, { type Cifra } from './CifrasPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

const RESUMEN: readonly Cifra[] = [
  { recurso: 'fichas-coordinador', etiqueta: 'Fichas de perfil', destino: '/fichas-perfil' },
  { recurso: 'proyectos-coordinador', etiqueta: 'Proyectos de grado', destino: '/proyectos-grado' },
  { recurso: 'evaluaciones-coordinador', etiqueta: 'Evaluaciones', destino: '/evaluaciones' },
  { recurso: 'mapas-ruta-coordinador', etiqueta: 'Mapas de ruta', destino: '/mapas-ruta' },
];

const SOLICITUDES_RECIBIDAS: readonly Cifra[] = [
  {
    recurso: 'solicitudes-novedad-coordinador-recibidas',
    etiqueta: 'Novedades',
    destino: '/solicitudes',
  },
  {
    recurso: 'solicitudes-cambio-asesor-recibidas',
    etiqueta: 'Cambios de asesor',
    destino: '/solicitudes',
  },
  {
    recurso: 'solicitudes-ampliacion-plazo-recibidas',
    etiqueta: 'Ampliaciones de plazo',
    destino: '/solicitudes',
  },
];

const RECURSOS_RECIBIDAS = SOLICITUDES_RECIBIDAS.map((cifra) => cifra.recurso);

const ATAJOS: readonly Atajo[] = [
  { etiqueta: 'Gestionar fichas de perfil', icono: FileText, destino: '/fichas-perfil' },
  { etiqueta: 'Responder solicitudes', icono: ClipboardList, destino: '/solicitudes' },
  { etiqueta: 'Consultar la biblioteca', icono: BookOpen, destino: '/biblioteca' },
];

function fraseDeSolicitudes(total?: number): string | undefined {
  if (total === undefined) return undefined;
  if (total === 0) return 'No tienes solicitudes recibidas.';
  return `Tienes ${contarEnFrase(total, 'solicitud recibida', 'solicitudes recibidas')}.`;
}

export default function CoordinadorView() {
  const { total } = useConteos(RECURSOS_RECIBIDAS);

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={fraseDeSolicitudes(total)} />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <CifrasPanel titulo="Resumen del programa" cifras={RESUMEN} />
          <CifrasPanel
            titulo="Solicitudes recibidas"
            cifras={SOLICITUDES_RECIBIDAS}
            disposicion="lista"
          />
        </div>
        <div className={COLUMNA_LATERAL}>
          <AtajosPanel atajos={ATAJOS} />
        </div>
      </div>
    </div>
  );
}
