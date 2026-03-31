import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldOff } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';

@Component({
  selector: 'app-forbidden',
  template: `
    <div class="flex min-h-full items-center justify-center p-12" role="main">
      <div
        class="w-full max-w-md rounded-xl border border-border bg-surface p-10 text-center shadow-sm"
        aria-labelledby="forbidden-title">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <lucide-angular [img]="ShieldOffIcon" [size]="32" class="text-red-500" aria-hidden="true" />
        </div>
        <h1 id="forbidden-title" class="text-xl font-bold text-on-surface">Acceso Denegado</h1>
        <p class="mt-2 text-sm text-on-surface-secondary">
          No tienes los permisos necesarios para acceder a esta sección.
        </p>
        <a
          routerLink="/dashboard"
          class="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Ir al inicio
        </a>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
})
export class ForbiddenComponent {
  protected readonly ShieldOffIcon: LucideIconData = ShieldOff;
}

