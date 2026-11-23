import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';
import { guarded } from '../../guards/guarded';

const Evaluaciones = lazy(() => import('./Evaluaciones'));
const JuradosEvaluacion = lazy(() => import('./JuradosEvaluacion'));
const EvaluacionDelAsesor = lazy(() => import('./EvaluacionDelAsesor'));
const EvaluacionesCualitativasJurado = lazy(() => import('./EvaluacionesCualitativasJurado'));
const EvaluacionesCuantitativasJurado = lazy(() => import('./EvaluacionesCuantitativasJurado'));
const GestionarEvaluacionesCualitativasJurado = lazy(
  () => import('./GestionarEvaluacionesCualitativasJurado'),
);
const GestionarEvaluacionesCuantitativasJurado = lazy(
  () => import('./GestionarEvaluacionesCuantitativasJurado'),
);
const GestionarEvaluacionesCualitativasAsesor = lazy(
  () => import('./GestionarEvaluacionesCualitativasAsesor'),
);
const GestionarEvaluacionesCuantitativasAsesor = lazy(
  () => import('./GestionarEvaluacionesCuantitativasAsesor'),
);

export const rutasEvaluaciones: RouteObject = {
  path: 'evaluaciones',
  element: guarded('evaluaciones', <Outlet />),
  children: [
    { index: true, element: <Evaluaciones /> },
    {
      path: ':evaluacionAsesorId/gestionar-cualitativas-asesor',
      element: <GestionarEvaluacionesCualitativasAsesor />,
    },
    {
      path: ':evaluacionAsesorId/gestionar-cuantitativas-asesor',
      element: <GestionarEvaluacionesCuantitativasAsesor />,
    },
    {
      path: ':evaluacionJuradoId/gestionar-cualitativas',
      element: <GestionarEvaluacionesCualitativasJurado />,
    },
    {
      path: ':evaluacionJuradoId/gestionar-cuantitativas',
      element: <GestionarEvaluacionesCuantitativasJurado />,
    },
    { path: ':evaluacionId/jurados', element: <JuradosEvaluacion /> },
    { path: ':evaluacionId/asesor', element: <EvaluacionDelAsesor /> },
    {
      path: ':evaluacionJuradoId/cualitativas',
      element: <EvaluacionesCualitativasJurado />,
    },
    {
      path: ':evaluacionJuradoId/cuantitativas',
      element: <EvaluacionesCuantitativasJurado />,
    },
  ],
};
