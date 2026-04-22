import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import AuthGuard from './guards/AuthGuard';
import AppLayout from './layout/AppLayout';
import ForbiddenPage from './shared/components/ForbiddenPage';

// Lazy feature imports — AppLayout's <Suspense> handles loading states
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const FichasPerfil = lazy(() => import('./features/fichas-perfil/FichasPerfil'));
const ProyectosGrado = lazy(() => import('./features/proyectos-grado/ProyectosGrado'));
const Artefactos = lazy(() => import('./features/artefactos/Artefactos'));
const Entregables = lazy(() => import('./features/entregables/Entregables'));
const Evaluaciones = lazy(() => import('./features/evaluaciones/Evaluaciones'));
const MapasRuta = lazy(() => import('./features/mapas-ruta/MapasRuta'));
const RepositorioArtefactos = lazy(
  () => import('./features/repositorio-artefactos/RepositorioArtefactos'),
);
const Biblioteca = lazy(() => import('./features/biblioteca/Biblioteca'));
const Solicitudes = lazy(() => import('./features/solicitudes/Solicitudes'));
const ExampleList = lazy(
  () => import('./features/example-domain/components/ExampleList'),
);
const SeleccionarRol = lazy(() => import('./features/seleccionar-rol/SeleccionarRol'));

/**
 * Exported so the Axios error interceptor can call router.navigate('/forbidden')
 * outside the React tree (hooks/useNavigate unavailable in interceptors).
 */
export const router = createBrowserRouter([
  {
    // AuthGuard: shows AppLoader while Keycloak initializes, then renders Outlet
    element: <AuthGuard />,
    children: [
      {
        // AppLayout: shell with Header + conditional Sidebar
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'fichas-perfil', element: <FichasPerfil /> },
          { path: 'proyectos-grado', element: <ProyectosGrado /> },
          { path: 'artefactos', element: <Artefactos /> },
          { path: 'entregables', element: <Entregables /> },
          { path: 'evaluaciones', element: <Evaluaciones /> },
          { path: 'mapas-ruta', element: <MapasRuta /> },
          { path: 'repositorio-artefactos', element: <RepositorioArtefactos /> },
          { path: 'biblioteca', element: <Biblioteca /> },
          { path: 'solicitudes', element: <Solicitudes /> },
          { path: 'example-domain', element: <ExampleList /> },
          { path: 'seleccionar-rol', element: <SeleccionarRol /> },
          { path: '*', element: <Navigate to="/dashboard" replace /> },
        ],
      },
    ],
  },
  { path: 'forbidden', element: <ForbiddenPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
