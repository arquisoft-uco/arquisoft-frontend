import { BookOpen, Map, Send } from 'lucide-react';
import { useFichaDelEstudiante } from '../hooks/useFichaDelEstudiante';
import AtajosPanel, { type Atajo } from './AtajosPanel';
import CifrasPanel, { type Cifra } from './CifrasPanel';
import ActividadRecientePanel from './estudiante/ActividadRecientePanel';
import FichaEstudianteTarjeta from './estudiante/FichaEstudianteTarjeta';
import RutaAcademicaPanel from './estudiante/RutaAcademicaPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

const AVANCE: readonly Cifra[] = [
  { recurso: 'artefactos-estudiante', etiqueta: 'Artefactos asignados', destino: '/artefactos' },
  { recurso: 'evaluaciones-estudiante', etiqueta: 'Evaluaciones', destino: '/evaluaciones' },
];

const ATAJOS: readonly Atajo[] = [
  { etiqueta: 'Enviar una solicitud', icono: Send, destino: '/solicitudes' },
  { etiqueta: 'Ver tu mapa de ruta', icono: Map, destino: '/mapas-ruta' },
  { etiqueta: 'Consultar la biblioteca', icono: BookOpen, destino: '/biblioteca' },
];

function fraseDeFicha(estado?: string, cargado?: boolean): string | undefined {
  if (!cargado) return undefined;
  return estado
    ? `Tu ficha de perfil está en «${estado}».`
    : 'Aún no tienes una ficha de perfil asignada.';
}

export default function EstudianteView() {
  const { ficha, cargado } = useFichaDelEstudiante();

  return (
    <div className={PAGINA}>
      <EncabezadoInicio frase={fraseDeFicha(ficha?.estadoNombre, cargado)} />
      <div className={CONTENEDOR}>
        <div className={COLUMNA_PRINCIPAL}>
          <FichaEstudianteTarjeta />
          <CifrasPanel titulo="Tu avance" cifras={AVANCE} />
          <ActividadRecientePanel />
        </div>
        <div className={COLUMNA_LATERAL}>
          <RutaAcademicaPanel />
          <AtajosPanel atajos={ATAJOS} />
        </div>
      </div>
    </div>
  );
}
