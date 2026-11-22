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
const InformacionEvaluacionAsesor = lazy(() => import('./InformacionEvaluacionAsesor'));
const EvaluacionesCualitativasAsesor = lazy(() => import('./EvaluacionesCualitativasAsesor'));
const EvaluacionesCuantitativasAsesor = lazy(() => import('./EvaluacionesCuantitativasAsesor'));
const RegistrarEvaluacionesCualitativasAsesor = lazy(
  () => import('./RegistrarEvaluacionesCualitativasAsesor'),
);
const RegistrarEvaluacionesCuantitativasAsesor = lazy(
  () => import('./RegistrarEvaluacionesCuantitativasAsesor'),
);

export const rutasEvaluaciones: RouteObject = {
  path: 'evaluaciones',
  element: guarded('evaluaciones', <Outlet />),
  children: [
    { index: true, element: <Evaluaciones /> },
    {
      path: ':evaluacionAsesorId/evaluar-asesor',
      element: <RegistrarEvaluacionesCualitativasAsesor />,
    },
    {
      path: ':evaluacionAsesorId/evaluar-cuantitativas-asesor',
      element: <RegistrarEvaluacionesCuantitativasAsesor />,
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
      path: ':evaluacionAsesorId/informacion',
      element: <InformacionEvaluacionAsesor />,
    },
    {
      path: ':evaluacionAsesorId/cualitativas-asesor',
      element: <EvaluacionesCualitativasAsesor />,
    },
    {
      path: ':evaluacionAsesorId/cuantitativas-asesor',
      element: <EvaluacionesCuantitativasAsesor />,
    },
    {
      path: ':evaluacionJuradoId/cuantitativas',
      element: <EvaluacionesCuantitativasJurado />,
    },
  ],
};
