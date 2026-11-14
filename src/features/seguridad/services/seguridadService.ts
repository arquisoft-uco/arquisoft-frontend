import type { SecurityUiModule } from '../models/SecurityUi';

export const seguridadService = {
  cargarModulo: (url: string): Promise<SecurityUiModule> =>
    import(/* @vite-ignore */ url).then((modulo: SecurityUiModule) => modulo),
};
