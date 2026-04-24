---
description: "Usar al crear o editar componentes React (.tsx): estructura interna, estado local, formularios con react-hook-form + Zod, manejo de loading/error con React Query, control de acceso por rol."
applyTo: "src/**/*.tsx"
---

# Reglas para componentes React

## Orden interno obligatorio

```tsx
// 1. Imports
// 2. Constantes del módulo (fuera del componente)
// 3. interface Props { ... }
// 4. export default function NombreComponente({ prop1 }: Props) {
//   5. Hooks (useState, useQuery, useStore, useForm)
//   6. Variables derivadas
//   7. Handlers (handleX o verbo de acción)
//   8. return ( JSX )
// }
```

## Estado

| Situación | Solución |
|-----------|---------|
| 1-2 valores locales de UI | `useState` |
| Datos del servidor | `useQuery` / `useMutation` |
| Compartido entre features | Zustand store en `src/stores/` |

Nunca: `useEffect` + `fetch` / `axios` directamente.

## Formularios

- **3+ campos** → react-hook-form + Zod:

```tsx
const schema = z.object({ titulo: z.string().min(1, 'Requerido') });
type FormValues = z.infer<typeof schema>;
const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
  resolver: zodResolver(schema),
});
```

- **1-2 campos** → `useState` es aceptable.

## Estados de carga y error

Siempre manejar `isLoading` e `isError` de `useQuery`:

```tsx
if (isLoading) return <PageSkeleton />;
if (isError) return <div role="alert">Error: {error.message}</div>;
```

## Control de acceso

```tsx
// Proteger sección de UI por rol
const esCoordinador = useHasRole(Rol.Coordinador);
{esCoordinador && <BotonCrear />}

// Proteger ruta completa en router.tsx
<RoleGuard roles={[Rol.Coordinador, Rol.Asesor]}>
  <MiFeature />
</RoleGuard>
```

Usar siempre el enum `Rol` de `src/shared/models/rol.ts`. Nunca strings literales.

## Accesibilidad

- `role="alert"` en mensajes de error.
- `aria-live="polite"` en contenido que cambia dinámicamente.
- `aria-busy="true"` durante estados de carga.
- `aria-label` en botones icono sin texto visible.

## Estilos

Usar clases semánticas del design system:
- Fondos: `bg-surface`, `bg-surface-secondary`
- Texto: `text-on-surface`, `text-on-surface-secondary`
- Bordes: `border-border`
- Entrada de secciones: `animate-fade-up`

No escribir CSS custom salvo en `src/index.css` o `src/tailwind.css`.
