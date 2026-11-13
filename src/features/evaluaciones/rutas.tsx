import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';
import { guarded } from '../../guards/guarded';

const Evaluaciones = lazy(() => import('./Evaluaciones'));
const JuradosEvaluacion = lazy(() => import('./JuradosEvaluacion'));
const EvaluacionesCualitativasJurado = lazy(() => import('./EvaluacionesCualitativasJurado'));
const EvaluacionesCuantitativasJurado = lazy(() => import('./EvaluacionesCuantitativasJurado'));
const RegistrarEvaluacionesCuantitativas = lazy(
  () => import('./RegistrarEvaluacionesCuantitativas'),
);
const EvaluacionesCualitativasRealizadasJurado = lazy(
  () => import('./EvaluacionesCualitativasRealizadasJurado'),
);
const EvaluacionesCuantitativasRealizadasJurado = lazy(
  () => import('./EvaluacionesCuantitativasRealizadasJurado'),
);
const RegistrarEvaluacionesCualitativas = lazy(() => import('./RegistrarEvaluacionesCualitativas'));

export const rutasEvaluaciones: RouteObject = {
  path: 'evaluaciones',
  element: guarded('evaluaciones', <Outlet />),
  children: [
    { index: true, element: <Evaluaciones /> },
    {
      path: ':evaluacionJuradoId/evaluar',
      element: <RegistrarEvaluacionesCualitativas />,
    },
    {
      path: ':evaluacionJuradoId/evaluar-cuantitativas',
      element: <RegistrarEvaluacionesCuantitativas />,
    },
    { path: ':evaluacionId/jurados', element: <JuradosEvaluacion /> },
    {
      path: ':evaluacionJuradoId/cualitativas',
      element: <EvaluacionesCualitativasJurado />,
    },
    {
      path: ':evaluacionJuradoId/cualitativas-realizadas',
      element: <EvaluacionesCualitativasRealizadasJurado />,
    },
    {
      path: ':evaluacionJuradoId/cuantitativas-realizadas',
      element: <EvaluacionesCuantitativasRealizadasJurado />,
    },
    {
      path: ':evaluacionJuradoId/cuantitativas',
      element: <EvaluacionesCuantitativasJurado />,
    },
  ],
};
