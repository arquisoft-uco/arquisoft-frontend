import { useFichaDelEstudiante } from '../hooks/useFichaDelEstudiante';
import ActividadRecientePanel from './estudiante/ActividadRecientePanel';
import AtajosEstudiantePanel from './estudiante/AtajosEstudiantePanel';
import FichaEstudianteTarjeta from './estudiante/FichaEstudianteTarjeta';
import RutaAcademicaPanel from './estudiante/RutaAcademicaPanel';
import { COLUMNA_LATERAL, COLUMNA_PRINCIPAL, CONTENEDOR, PAGINA } from './disposicion';
import EncabezadoInicio from './EncabezadoInicio';

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
          <ActividadRecientePanel />
        </div>
        <div className={COLUMNA_LATERAL}>
          <RutaAcademicaPanel />
          <AtajosEstudiantePanel />
        </div>
      </div>
    </div>
  );
}
