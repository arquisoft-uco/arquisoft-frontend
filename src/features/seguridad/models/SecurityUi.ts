export interface SecurityUiTema {
  accent: string;
  fontFamily: string;
  radius: string;
}

export interface SecurityUiOptions {
  applicationName: string;
  apiBaseUrl: string;
  allowApplicationLifecycleManagement: boolean;
  theme: SecurityUiTema;
}

export interface SecurityUiHandle {
  element: HTMLElement;
  refresh: () => Promise<void>;
  unmount: () => void;
}

export interface SecurityUiModule {
  mount: (contenedor: HTMLElement, opciones: SecurityUiOptions) => SecurityUiHandle;
}
