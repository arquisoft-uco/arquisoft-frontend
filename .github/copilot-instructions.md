# Arquisoft Frontend — Instrucciones para GitHub Copilot

## Comportamiento del asistente

- **Idioma de respuesta:** español colombiano en todo momento, sin excepciones.
- **Estilo:** respuestas concisas y directas — solo la información relevante. Evitar explicaciones largas o relleno innecesario.
- **README.md:** si un cambio afecta el stack, comandos, estructura o dependencias, actualizar `README.md` como parte de la tarea.

---

## Contexto del proyecto

Aplicación web de gestión académica construida con React 19 + TypeScript + Vite.
Autenticación vía Keycloak. Backend REST con respuestas paginadas (`Page<T>`).

Ver [README.md](../README.md) para stack completo y [CONTRIBUTING.md](../CONTRIBUTING.md) para convenciones de Git.

---

## Stack y versiones clave

| Rol | Librería |
|-----|---------|
| UI | React 19 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Routing | React Router 7 |
| Estado global | Zustand 5 |
| Fetching / caché | TanStack React Query 5 |
| Formularios | React Hook Form 7 + Zod 3 |
| HTTP | Axios (via `src/api/axiosInstance.ts`) |
| Autenticación | Keycloak JS 26 |
| Iconos | Lucide React |
| Testing | Vitest + Testing Library |

---

## Arquitectura

El proyecto usa **feature-based architecture**. Cada módulo de negocio vive en `src/features/<nombre>/` con esta estructura interna:

```
src/features/<feature>/
├── <Feature>.tsx          # Página raíz del feature (lazy-loaded en router.tsx)
├── components/            # Componentes del feature
├── hooks/                 # Custom hooks del feature
├── models/                # Interfaces y tipos TypeScript
└── services/              # Funciones que llaman a la API (usan apiClient)
```

El feature `example-domain` es la **referencia canónica** de implementación. Seguir siempre ese patrón al crear un feature nuevo.

---

## Nomenclatura

- **Términos de dominio/negocio:** en español (ej: `fichasPerfil`, `rolActivo`, `idAsesor`)
- **Sufijos técnicos y patrones:** en inglés (ej: `useQuery`, `Store`, `Service`, `Guard`, `Hook`)
- **Roles:** usar siempre el enum `Rol` de `src/shared/models/rol.ts`. Nunca strings literales.
- **Componentes:** PascalCase (ej: `RegistrarFichaPerfil`)
- **Funciones/hooks/variables:** camelCase (ej: `useRolActivo`, `idEstudiantes`)
- **Archivos de componentes:** PascalCase.tsx (ej: `AsesorFichaView.tsx`)
- **Archivos de services/models/hooks:** camelCase.ts (ej: `fichasPerfilService.ts`)

---

## Reglas de componentes (`.tsx`)

### Orden interno de un componente

```tsx
// 1. Imports
// 2. Constantes del módulo (fuera del componente)
// 3. interface Props { ... }
// 4. export default function NombreComponente({ prop1, prop2 }: Props) {
//   5. Hooks (useState, useQuery, useStore, useForm)
//   6. Variables derivadas / computed values
//   7. Handlers (funciones que empiezan con handle... o nombre de acción)
//   8. return ( ... JSX ... )
// }
```

### Estado

- **Estado local simple** (1-2 valores de UI): `useState`
- **Estado global compartido entre features**: Zustand store en `src/stores/`
- **Estado del servidor (datos de API)**: React Query — nunca `useEffect` + `fetch`/`axios` directamente

### Fetching de datos

```tsx
// ✅ Correcto — useQuery para GET
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['nombre-clave-unica'],
  queryFn: () => miService.getAll(),
});

// ✅ Correcto — useMutation para POST/PUT/DELETE
const { mutate, isPending } = useMutation({
  mutationFn: (payload) => miService.create(payload),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nombre-clave-unica'] }),
});

// ❌ Incorrecto
useEffect(() => { axios.get(...).then(...) }, []);
```

### Formularios

Para formularios con 3+ campos, usar **react-hook-form + Zod**:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  titulo: z.string().min(1, 'El título es requerido'),
});
type FormValues = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

Para formularios simples (1-2 campos), `useState` es aceptable.

---

## Servicios (`services/`)

- Siempre usar `apiClient` de `src/api/axiosInstance.ts`. Nunca importar `axios` directamente en services.
- El objeto de servicio es un **plain object** con métodos (no clase):

```ts
// ✅ Patrón correcto
import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { MiModelo } from '../models/MiModelo';

export const miFeatureService = {
  getAll: (page = 0, size = 10) =>
    apiClient.get<Page<MiModelo>>('endpoint', { params: { page, size } }).then((r) => r.data),
  getById: (id: number) =>
    apiClient.get<MiModelo>(`endpoint/${id}`).then((r) => r.data),
  create: (body: Omit<MiModelo, 'id'>) =>
    apiClient.post<MiModelo>('endpoint', body).then((r) => r.data),
};
```

---

## Modelos (`models/`)

- Solo interfaces y tipos TypeScript. Sin lógica.
- Usar `Page<T>` y `ApiResponse<T>` de `src/shared/models/api-response.ts` para respuestas de API.

---

## Stores Zustand (`src/stores/`)

- `authStore.ts` — token Keycloak, datos del usuario autenticado. **Solo lectura** desde features, no modificar directamente.
- `roleStore.ts` — rol activo seleccionado por el usuario. Persiste en `localStorage`.
- Para leer el rol activo y roles disponibles, usar los hooks de `src/hooks/useAuth.ts`.

---

## Control de acceso por rol

- Usar el enum `Rol` de `src/shared/models/rol.ts`.
- Para proteger rutas, envolver con `<RoleGuard roles={[Rol.Coordinador, Rol.Asesor]}>`.
- Para condicionar UI por rol, usar el hook `useHasRole(Rol.X)`.
- **El frontend no es la línea de seguridad final.** Ocultar elementos es UX; el backend valida cada request.

---

## Routing

- Todas las rutas se declaran en `src/router.tsx`.
- Las páginas raíz de features se importan con `React.lazy()` para code-splitting.
- El `<Suspense>` lo maneja `AppLayout`.

---

## Estilos (Tailwind CSS v4)

- Usar clases semánticas del design system: `bg-surface`, `text-on-surface`, `text-on-surface-secondary`, `border-border`, `bg-surface-secondary`.
- Animaciones: usar `animate-fade-up` para entradas de secciones.
- **No escribir CSS custom** salvo en `src/index.css` o `src/tailwind.css`.

---

## Testing

- Tests en archivos `*.test.tsx` / `*.test.ts` junto al código que prueban.
- Usar el helper `render` de `src/test-utils/render.tsx` (no el de Testing Library directamente).
- Ejecutar: `npm run test`

---

## Comandos principales

```bash
npm run dev      # Servidor de desarrollo (http://localhost:5173)
npm run build    # Compilar para producción
npm run test     # Tests con Vitest
npm run lint     # Chequeo TypeScript (tsc --noEmit)
```

---

## Convenciones de Git

### Commits — Conventional Commits en español

Formato: `<tipo>(<ámbito>): <descripción en español>`

| Tipo | Cuándo usarlo |
|------|--------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactor sin cambio de comportamiento |
| `test` | Añadir o corregir tests |
| `docs` | Cambios en documentación |
| `chore` | Tareas de mantenimiento (deps, config) |
| `style` | Cambios de formato/estilo sin lógica |
| `hotfix` | Corrección urgente en producción |

**Ejemplos correctos:**
```
feat(fichas-perfil): agregar vista de coordinador para registrar ficha
fix(auth): corregir redirección al expirar token
refactor(solicitudes): extraer lógica de filtrado a hook personalizado
docs(readme): actualizar sección de comandos de desarrollo
```

**Reglas:**
- Descripción en **infinitivo** y **minúsculas** (no "Agregué", sino "agregar")
- Sin punto al final
- Ámbito: nombre del feature o módulo afectado (ej: `fichas-perfil`, `auth`, `router`)

### Ramas

Formato: `<prefijo>/<id>-<descripcion_snake_case>`

Prefijos válidos: `feature/`, `fix/`, `refactor/`, `hotfix/`, `docs/`, `test/`, `chore/`, `spike/`

---

## Buenas prácticas de React y TypeScript

- **TypeScript estricto:** tipar siempre las props, valores de retorno de funciones y respuestas de API. Evitar `any`.
- **Componentes pequeños:** un componente = una responsabilidad. Si supera ~150 líneas, extraer sub-componentes.
- **Hooks personalizados:** extraer lógica compleja a `hooks/` cuando el componente mezcla fetch + transformación + estado.
- **Inmutabilidad:** nunca mutar estado directamente. Usar spread (`...`) o métodos funcionales (`map`, `filter`).
- **Keys en listas:** siempre usar un identificador único estable como `key` en listas renderizadas, nunca el índice del array.
- **Evitar efectos innecesarios:** si el valor se puede calcular sincrónicamente, no usar `useEffect`. React Query cubre la mayoría de los casos de sincronización con servidor.
- **Accesibilidad:** incluir atributos `aria-*` en elementos interactivos, `role="alert"` en errores, `aria-live` en contenido dinámico.

---

## Principios SOLID aplicados al proyecto

| Principio | Aplicación concreta |
|-----------|-------------------|
| **S** — Single Responsibility | Un componente renderiza, un hook gestiona lógica, un service llama la API. No mezclar. |
| **O** — Open/Closed | Extender comportamiento añadiendo props opcionales o nuevos hooks, sin modificar el contrato existente. |
| **L** — Liskov | Si un componente acepta `ReactNode`, cualquier elemento válido de React debe funcionar sin romper el layout. |
| **I** — Interface Segregation | Interfaces pequeñas y específicas en `models/`. No una interfaz gigante con campos opcionales. |
| **D** — Dependency Inversion | Los componentes dependen de hooks/services (abstracciones), no llaman `axios` directamente. |
