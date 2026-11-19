import { useLocation, useNavigate, useParams } from 'react-router';
import PageHeader from '../../../../shared/components/ui/PageHeader';
import { useJuradosEvaluacion } from '../../hooks/useJuradosEvaluacion';
import { useResumenEvaluacion } from '../../hooks/useResumenEvaluacion';
import type { EvaluacionJurado } from '../../models/EvaluacionJurado';
import type { NavegacionEvaluacionJurado } from '../../models/NavegacionEvaluacionJurado';
import AccionesJuradoEvaluacion from './AccionesJuradoEvaluacion';
import ListadoJuradosEvaluacion from './ListadoJuradosEvaluacion';

const RAIZ = 'flex flex-col gap-6';

export default function JuradosEvaluacionEstudianteView() {
  const { evaluacionId = '' } = useParams();
  const navigate = useNavigate();
  const { search: searchJurados } = useLocation();
  const { resumen, search } = useResumenEvaluacion(evaluacionId);
  const listado = useJuradosEvaluacion(evaluacionId);

  function irA(jurado: EvaluacionJurado, ruta: 'cualitativas' | 'cuantitativas') {
    const state: NavegacionEvaluacionJurado = {
      evaluacionJuradoId: jurado.id,
      evaluacionId,
      jurado: jurado.jurado.nombre,
      resumen,
      search,
      searchJurados,
    };
    navigate(`/evaluaciones/${jurado.id}/${ruta}`, { state });
  }

  function verCualitativa(jurado: EvaluacionJurado) {
    irA(jurado, 'cualitativas');
  }

  function verCuantitativa(jurado: EvaluacionJurado) {
    irA(jurado, 'cuantitativas');
  }

  const rutaListado = `/evaluaciones${search}`;
  const descripcion = resumen
    ? `${resumen.proyecto} · versión ${resumen.version}`
    : 'Consulta los jurados asignados a esta evaluación.';
  const migas = [
    { etiqueta: 'Evaluaciones', to: rutaListado },
    { etiqueta: 'Evaluaciones del jurado' },
  ];

  return (
    <div className={RAIZ}>
      <PageHeader titulo="Evaluaciones del jurado" descripcion={descripcion} migas={migas} />
      <ListadoJuradosEvaluacion
        listado={listado}
        onVolver={() => navigate(rutaListado)}
        encabezadoAcciones="Acciones"
        acciones={(jurado) => (
          <AccionesJuradoEvaluacion
            jurado={jurado}
            onVerCualitativa={verCualitativa}
            onVerCuantitativa={verCuantitativa}
          />
        )}
      />
    </div>
  );
}
