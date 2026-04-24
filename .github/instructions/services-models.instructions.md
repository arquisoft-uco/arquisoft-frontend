---
description: "Usar al crear o editar servicios de API, modelos TypeScript o stores Zustand. Cubre el patrón de plain object service, uso de apiClient, tipado con Page<T> y convenciones de interfaces."
applyTo: "src/features/**/services/*.ts, src/features/**/models/*.ts, src/stores/*.ts"
---

# Reglas para servicios, modelos y stores

## Servicios (`services/*.ts`)

- Siempre importar `apiClient` de `src/api/axiosInstance.ts`. **Nunca** importar `axios` directamente.
- El servicio es un **plain object** con métodos — no una clase.
- Siempre tipar la respuesta con genéricos:

```ts
import apiClient from '../../../api/axiosInstance';
import type { Page } from '../../../shared/models/api-response';
import type { MiModelo } from '../models/MiModelo';

export const miFeatureService = {
  getAll: (page = 0, size = 10) =>
    apiClient
      .get<Page<MiModelo>>('endpoint', { params: { page, size } })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<MiModelo>(`endpoint/${id}`).then((r) => r.data),

  create: (body: Omit<MiModelo, 'id'>) =>
    apiClient.post<MiModelo>('endpoint', body).then((r) => r.data),

  update: (id: number, body: Partial<Omit<MiModelo, 'id'>>) =>
    apiClient.put<MiModelo>(`endpoint/${id}`, body).then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete(`endpoint/${id}`),
};
```

## Modelos (`models/*.ts`)

- Solo interfaces y tipos TypeScript. **Sin lógica, sin funciones.**
- Para respuestas paginadas usar `Page<T>` de `src/shared/models/api-response.ts`.
- Interfaces específicas y pequeñas (principio ISP). No una interfaz gigante con campos opcionales.

```ts
// ✅ Correcto
export interface FichaPerfil {
  id: number;
  titulo: string;
  idAsesor: string;
  idEstudiantes: string[];
}

// ❌ Incorrecto — demasiado acoplado
export interface FichaPerfil {
  id?: number;
  titulo?: string;
  asesor?: { id: string; nombre: string; email: string };
  // ...20 campos más
}
```

## Stores Zustand (`src/stores/*.ts`)

- `authStore.ts` — **solo lectura** desde features. No modificar desde componentes.
- `roleStore.ts` — usar los hooks de `src/hooks/useAuth.ts` para leer el rol activo.
- Para un nuevo store, usar el mismo patrón: `create<State>()((set) => ({ ... }))`.
- No usar `persist` middleware salvo que los datos deban sobrevivir a un refresh de página.

## Manejo de errores en servicios

Los servicios **no atrapan errores** — los propagan. React Query los maneja con `isError` / `onError`:

```ts
// ✅ El service deja que el error suba
create: (body) => apiClient.post<MiModelo>('endpoint', body).then((r) => r.data),

// ✅ El componente / hook lo captura
const { mutate } = useMutation({
  mutationFn: miService.create,
  onError: (err) => toast.error('Error', err.message),
});
```
