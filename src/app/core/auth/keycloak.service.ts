import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

/** Segundos antes de la expiración en los que se dispara el refresh */
const REFRESH_BUFFER_SECONDS = 30;

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private readonly _destroyRef = inject(DestroyRef);

  private readonly _keycloak = new Keycloak({
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId,
  });

  private readonly _authenticated = signal(false);
  private readonly _userProfile = signal<Keycloak['profile']>(undefined);
  private readonly _token = signal<string | undefined>(undefined);

  readonly authenticated = this._authenticated.asReadonly();
  readonly userProfile = this._userProfile.asReadonly();
  readonly token = this._token.asReadonly();
  readonly username = computed(() => this._userProfile()?.username ?? '');

  async init(): Promise<void> {
    const authenticated = await this._keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
    });

    this._authenticated.set(authenticated);

    if (authenticated) {
      this._token.set(this._keycloak.token);
      const profile = await this._keycloak.loadUserProfile();
      this._userProfile.set(profile);
      this._scheduleTokenRefresh();
    }
  }

  logout(): void {
    this._keycloak.logout({ redirectUri: window.location.origin });
  }

  hasRealmRole(role: string): boolean {
    return this._keycloak.hasRealmRole(role);
  }

  hasResourceRole(role: string, resource?: string): boolean {
    return this._keycloak.hasResourceRole(role, resource);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRealmRole(role));
  }

  /**
   * Programa el próximo refresh dinámicamente basándose en el tiempo real
   * de expiración del token (`exp` del JWT). Solo corre cuando la pestaña
   * es visible, evitando trabajo innecesario en background.
   */
  private _scheduleTokenRefresh(): void {
    let timeoutId: ReturnType<typeof setTimeout>;

    const schedule = () => {
      clearTimeout(timeoutId);

      const exp = this._keycloak.tokenParsed?.['exp'];
      if (!exp) return;

      const nowSeconds = Math.floor(Date.now() / 1000);
      const msUntilRefresh = Math.max((exp - nowSeconds - REFRESH_BUFFER_SECONDS) * 1000, 0);

      timeoutId = setTimeout(async () => {
        // Esperar si la pestaña no está visible — se reintenta al volver
        if (document.visibilityState === 'hidden') {
          document.addEventListener('visibilitychange', schedule, { once: true });
          return;
        }

        try {
          const refreshed = await this._keycloak.updateToken(REFRESH_BUFFER_SECONDS);
          if (refreshed) {
            this._token.set(this._keycloak.token);
          }
          schedule();
        } catch {
          this.logout();
        }
      }, msUntilRefresh);
    };

    schedule();

    // Limpia el timeout cuando el servicio es destruido
    this._destroyRef.onDestroy(() => clearTimeout(timeoutId));
  }
}
