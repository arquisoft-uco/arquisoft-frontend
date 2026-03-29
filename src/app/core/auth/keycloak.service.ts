import { Injectable, signal, computed } from '@angular/core';
import Keycloak from 'keycloak-js';

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private readonly _win = window as unknown as Record<string, unknown>;
  private readonly _keycloak = new Keycloak({
    url: (this._win['KEYCLOAK_URL'] as string | undefined) ?? 'http://localhost:8080',
    realm: (this._win['KEYCLOAK_REALM'] as string | undefined) ?? 'master',
    clientId: (this._win['KEYCLOAK_CLIENT_ID'] as string | undefined) ?? 'angular-client',
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

  private _scheduleTokenRefresh(): void {
    setInterval(async () => {
      try {
        const refreshed = await this._keycloak.updateToken(60);
        if (refreshed) {
          this._token.set(this._keycloak.token);
        }
      } catch {
        this.logout();
      }
    }, 30_000);
  }
}
