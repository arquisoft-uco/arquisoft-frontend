import { lazy } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import AuthGuard from './guards/AuthGuard';
import { guarded } from './guards/guarded';
import AppLayout from './layout/AppLayout';
import { rutasEvaluaciones } from './features/evaluaciones/rutas';
import IniciarSesion from './features/iniciar-sesion/IniciarSesion';
import ForbiddenPage from './shared/components/ForbiddenPage';
import RouteErrorPage from './shared/components/RouteErrorPage';
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const FichasPerfil = lazy(() => import('./features/fichas-perfil/FichasPerfil'));
const DetalleFicha = lazy(() => import('./features/fichas-perfil/DetalleFicha'));
const PestanaFicha = lazy(() => import('./features/fichas-perfil/components/PestanaFicha'));
const ProyectosGrado = lazy(() => import('./features/proyectos-grado/ProyectosGrado'));
const DetalleProyectoGrado = lazy(() => import('./features/proyectos-grado/DetalleProyectoGrado'));
const PestanaProyectoGrado = lazy(
  () => import('./features/proyectos-grado/components/PestanaProyectoGrado'),
);
const Artefactos = lazy(() => import('./features/artefactos/Artefactos'));
const Entregables = lazy(() => import('./features/entregables/Entregables'));
const MapasRuta = lazy(() => import('./features/mapas-ruta/MapasRuta'));
const DetalleTarea = lazy(() => import('./features/mapas-ruta/DetalleTarea'));
const TareasMapaRutaProyecto = lazy(() => import('./features/mapas-ruta/TareasMapaRutaProyecto'));
const PlanesEstimadosProyecto = lazy(() => import('./features/mapas-ruta/PlanesEstimadosProyecto'));
const PlanesRealesProyecto = lazy(() => import('./features/mapas-ruta/PlanesRealesProyecto'));
const RepositorioArtefactos = lazy(
  () => import('./features/repositorio-artefactos/RepositorioArtefactos'),
);
const VersionesRepositorio = lazy(
  () => import('./features/repositorio-artefactos/VersionesRepositorio'),
);
const Biblioteca = lazy(() => import('./features/biblioteca/Biblioteca'));
const Solicitudes = lazy(() => import('./features/solicitudes/Solicitudes'));
const SeleccionarRol = lazy(() => import('./features/seleccionar-rol/SeleccionarRol'));
const Usuarios = lazy(() => import('./features/usuarios/Usuarios'));
const Seguridad = lazy(() => import('./features/seguridad/Seguridad'));

// Exportado para que el interceptor de Axios navegue a /forbidden fuera del árbol de React.
export const router = createBrowserRouter([
  {
    element: <AuthGuard />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          {
            path: 'fichas-perfil',
            element: guarded('fichas-perfil', <Outlet />),
            children: [
              { index: true, element: <FichasPerfil /> },
              {
                path: ':id',
                element: <DetalleFicha />,
                children: [
                  { index: true, element: <Navigate to="items" replace /> },
                  { path: 'items', element: <PestanaFicha pestana="items" /> },
                  { path: 'revisiones', element: <PestanaFicha pestana="revisiones" /> },
                  { path: 'observaciones', element: <PestanaFicha pestana="observaciones" /> },
                  { path: 'estados', element: <PestanaFicha pestana="estados" /> },
                  { path: 'evaluaciones', element: <PestanaFicha pestana="evaluaciones" /> },
                ],
              },
            ],
          },
          {
            path: 'proyectos-grado',
            element: guarded('proyectos-grado', <Outlet />),
            children: [
              { index: true, element: <ProyectosGrado /> },
              {
                path: ':id',
                element: <DetalleProyectoGrado />,
                children: [
                  { index: true, element: <PestanaProyectoGrado /> },
                  { path: 'asesores', element: <PestanaProyectoGrado pestana="asesores" /> },
                  { path: 'estados', element: <PestanaProyectoGrado pestana="estados" /> },
                ],
              },
            ],
          },
          { path: 'artefactos', element: guarded('artefactos', <Artefactos />) },
          { path: 'entregables', element: guarded('entregables', <Entregables />) },
          rutasEvaluaciones,
          {
            path: 'mapas-ruta',
            element: guarded('mapas-ruta', <Outlet />),
            children: [
              { index: true, element: <MapasRuta /> },
              { path: 'tareas/:id', element: <DetalleTarea /> },
              {
                path: 'proyectos/:proyectoGradoId/tareas',
                element: <TareasMapaRutaProyecto />,
              },
              {
                path: 'proyectos/:proyectoGradoId/planes-estimados',
                element: <PlanesEstimadosProyecto />,
              },
              {
                path: 'proyectos/:proyectoGradoId/planes-reales',
                element: <PlanesRealesProyecto />,
              },
            ],
          },
          {
            path: 'repositorio-artefactos',
            element: guarded('repositorio-artefactos', <Outlet />),
            children: [
              { index: true, element: <RepositorioArtefactos /> },
              { path: ':repositorioId/versiones', element: <VersionesRepositorio /> },
            ],
          },
          { path: 'biblioteca', element: guarded('biblioteca', <Biblioteca />) },
          { path: 'solicitudes', element: guarded('solicitudes', <Solicitudes />) },
          { path: 'usuarios', element: guarded('usuarios', <Usuarios />) },
          { path: 'seguridad', element: guarded('seguridad', <Seguridad />) },
          { path: 'seleccionar-rol', element: <SeleccionarRol /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  { path: 'iniciar-sesion', element: <IniciarSesion /> },
  { path: 'forbidden', element: <ForbiddenPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
