import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import Keycloak, { KeycloakTokenParsed } from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../logging/logger.service';

/** Segundos antes de la expiración en los que se dispara el refresh */
const REFRESH_BUFFER_SECONDS = 30;

const CTX = 'KeycloakService';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _logger = inject(LoggerService);

  private readonly _keycloak = new Keycloak({
    url: environment.keycloak.url,
    realm: environment.keycloak.realm,
    clientId: environment.keycloak.clientId,
  });

  private readonly _authenticated = signal(false);
  private readonly _userProfile = signal<Keycloak['profile']>(undefined);
  private readonly _token = signal<string | undefined>(undefined);
  private readonly _tokenParsed = signal<KeycloakTokenParsed | undefined>(undefined);

  readonly authenticated = this._authenticated.asReadonly();
  readonly userProfile = this._userProfile.asReadonly();
  readonly token = this._token.asReadonly();
  readonly username = computed(() => this._userProfile()?.username ?? '');

  /**
   * Roles del cliente `angular-app` extraídos de `resource_access[clientId].roles` del JWT.
   * Es el signal reactivo que deben consumir directivas y guards.
   */
  readonly roles = computed<string[]>(() => {
    const parsed = this._tokenParsed();
    const access = parsed?.['resource_access'] as
      | Record<string, { roles?: string[] }>
      | undefined;
    return access?.[environment.keycloak.clientId]?.roles ?? [];
  });

  async init(): Promise<void> {
    this._logger.debug(CTX, 'Initializing Keycloak…');

    const authenticated = await this._keycloak.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
    });

    this._authenticated.set(authenticated);
    this._logger.info(CTX, `Authentication result: ${authenticated}`);

    if (authenticated) {
      this._token.set(this._keycloak.token);
      this._tokenParsed.set(this._keycloak.tokenParsed);

      const profile = await this._keycloak.loadUserProfile();
      this._userProfile.set(profile);

      const clientRoles = (
        this._keycloak.tokenParsed?.['resource_access'] as
          | Record<string, { roles?: string[] }>
          | undefined
      )?.[environment.keycloak.clientId]?.roles ?? [];

      this._logger.info(CTX, `User "${profile.username}" authenticated`, {
        clientId: environment.keycloak.clientId,
        clientRoles,
      });

      this._scheduleTokenRefresh();
    }
  }

  logout(): void {
    this._logger.info(CTX, 'Logging out user');
    this._keycloak.logout({ redirectUri: window.location.origin });
  }

  hasRealmRole(role: string): boolean {
    return this._keycloak.hasRealmRole(role);
  }

  hasResourceRole(role: string, resource?: string): boolean {
    return this._keycloak.hasResourceRole(role, resource);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasResourceRole(role, environment.keycloak.clientId));
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
          this._logger.debug(CTX, 'Tab hidden — deferring token refresh until visible');
          document.addEventListener('visibilitychange', schedule, { once: true });
          return;
        }

        try {
          const refreshed = await this._keycloak.updateToken(REFRESH_BUFFER_SECONDS);
          if (refreshed) {
            this._token.set(this._keycloak.token);
            this._tokenParsed.set(this._keycloak.tokenParsed);
            this._logger.debug(CTX, 'Token refreshed successfully');
          } else {
            this._logger.debug(CTX, 'Token still valid — no refresh needed');
          }
          schedule();
        } catch (err) {
          this._logger.error(CTX, 'Token refresh failed — logging out', err);
          this.logout();
        }
      }, msUntilRefresh);
    };

    schedule();

    // Limpia el timeout cuando el servicio es destruido
    this._destroyRef.onDestroy(() => clearTimeout(timeoutId));
  }
}
